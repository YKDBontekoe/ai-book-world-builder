const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * AGENTIC SUPERVISOR (v4.8)
 * 
 * Centralized orchestration for AI agents.
 * Features:
 * - Batched Feedback (CI + Codecov + CodeRabbit)
 * - Synchronized Execution (Waits for all signals)
 * - Author-based Invocation Strategy (Hybrid)
 * - Smart Auto-Triage & Labeling
 * - Infinite Loop Protection
 * - Input Sanitization for Shell Commands
 * - Enhanced Error Logging
 * - Rich Dashboard with Metrics & Decision Flow
 */

// =============================================================================
// HELPERS
// =============================================================================

function parseListEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  LOOP_THRESHOLD: 3,
  LOG_TRUNCATE_LENGTH: 2000,
  CODERABBIT_COMMENT_LIMIT: 50,
  CODERABBIT_USERS: parseListEnv('CODERABBIT_USERS', ['coderabbitai[bot]', 'coderabbitai']),
  CODECOV_USERS: parseListEnv('CODECOV_USERS', ['codecov[bot]', 'codecov']),
  BOT_USERS: parseListEnv('SUPERVISOR_BOT_USERS', [
    'google-labs-jules',
    'jules',
    'renovate[bot]',
    'coderabbitai[bot]',
    'coderabbitai',
    'codecov[bot]',
    'codecov',
    'github-actions[bot]'
  ]),
  SIGNATURE_PREFIX: '<!-- JULES_SUPERVISOR_SIG',
  IGNORE_PHRASES: [
    'no actionable comments',
    'looks good',
    'lgtm'
  ]
};

function log(msg, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[Supervisor ${timestamp}] ${msg}`, JSON.stringify(data));
  } else {
    console.log(`[Supervisor ${timestamp}] ${msg}`);
  }
}

function logError(msg, error) {
  const timestamp = new Date().toISOString();
  console.error(`[Supervisor ERROR ${timestamp}] ${msg}:`, error.message || error);
}

/**
 * Sanitize a string for safe use in shell commands.
 * Prevents command injection attacks.
 */
function sanitizeShellArg(arg) {
  if (!arg) return '';
  return String(arg).replace(/[`$\\!"']/g, '\\$&');
}

function normalizeLogin(login) {
  return (login || '').toString().toLowerCase();
}

function isCodeRabbitUser(login) {
  const normalized = normalizeLogin(login);
  return CONFIG.CODERABBIT_USERS.some(user => normalized === user);
}

function isCodecovUser(login) {
  const normalized = normalizeLogin(login);
  return CONFIG.CODECOV_USERS.some(user => normalized === user);
}

function isBotUser(login) {
  const normalized = normalizeLogin(login);
  return CONFIG.BOT_USERS.some(user => normalized === user);
}

function buildSignature(context, decision) {
  const sha = context.sha || 'n/a';
  const reason = (decision.reason || 'n/a').replace(/\s+/g, '-').slice(0, 80);
  return `${CONFIG.SIGNATURE_PREFIX} sha:${sha} reason:${reason} -->`;
}

function getAttemptCount(labels) {
  if (!labels || labels.length === 0) return 0;
  return labels.reduce((max, label) => {
    const match = /^jules-attempt-(\d+)$/.exec(label);
    if (!match) return max;
    const value = Number.parseInt(match[1], 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
}

async function incrementAttemptLabel(number, labels) {
  const current = getAttemptCount(labels);
  const next = current + 1;
  if (!number || next <= 0) return;
  await addLabels(number, [`jules-attempt-${next}`]);
}

function setOutput(key, value) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) {
    console.log(`::set-output name=${key}::${value}`);
    return;
  }
  
  if (value && (value.includes('\n') || value.includes('\r'))) {
    const delimiter = `EOF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    fs.appendFileSync(output, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
  } else {
    fs.appendFileSync(output, `${key}=${value}\n`);
  }
}

function exec(command, options = {}) {
  const { silent = true, throwOnError = false } = options;
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    if (!silent) {
      logError(`Command failed: ${command.substring(0, 100)}...`, e);
    }
    if (throwOnError) throw e;
    return '';
  }
}

function getPrompt(filename, replacements = {}) {
  try {
    let content = fs.readFileSync(`.github/prompts/${filename}`, 'utf8');
    for (const [key, val] of Object.entries(replacements)) {
      content = content.replaceAll(`$${key}`, val ?? '');
    }
    return content;
  } catch (e) {
    log(`Warning: Prompt file ${filename} not found.`);
    return '';
  }
}

async function addLabels(number, labels) {
  if (!labels || labels.length === 0) return;
  // Sanitize labels to prevent command injection
  const sanitizedLabels = labels.map(l => sanitizeShellArg(l));
  const labelStr = sanitizedLabels.join(',');
  log(`Adding labels: ${labelStr}`);
  try {
    exec(`gh issue edit ${number} --add-label "${labelStr}"`);
  } catch (e) {
    logError(`Failed to add labels to #${number}`, e);
  }
}

// --- Batched Feedback Helpers ---

function getCodeRabbitFeedback(repo, number) {
  if (!number || !Number.isInteger(Number(number)) || Number(number) <= 0) {
      logError(`Invalid PR number: ${number}`);
      return '';
  }

  try {
    let reviewSummary = '';
    let latestReviewTimestamp = null;
    // 1. Get Review Summaries (Top-level comments)
    try {
      const reviewsJson = exec(`gh api "/repos/${repo}/pulls/${number}/reviews?per_page=100" --paginate`);
      if (reviewsJson) {
        const reviews = JSON.parse(reviewsJson);
        const rabbitReviews = reviews
          .filter(r => isCodeRabbitUser(r.user?.login) && r.state !== 'DISMISSED')
          .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

        if (rabbitReviews.length > 0) {
          const latest = rabbitReviews[0];
          latestReviewTimestamp = latest.submitted_at ? new Date(latest.submitted_at) : null;
          const bodyLower = (latest.body || '').toLowerCase();
          const shouldIgnore = CONFIG.IGNORE_PHRASES.some(phrase => bodyLower.includes(phrase.toLowerCase()));

          if (latest.body && latest.body.length > 10 && !shouldIgnore) {
            reviewSummary = `### 🐰 CodeRabbit Summary\n\n${latest.body}`;
          }
        }
      }
    } catch (e) {
      logError('Failed to fetch CodeRabbit reviews', e);
    }

    // 2. Get Inline Comments
    let comments = [];
    try {
      const json = exec(`gh api "/repos/${repo}/pulls/${number}/comments?per_page=100" --paginate --jq '.[]' | jq -s '.'`);
      comments = JSON.parse(json);
    } catch (e) {
      // Fallback for environments without jq
      try {
        const raw = exec(`gh api "/repos/${repo}/pulls/${number}/comments?per_page=100" --paginate`);
        if (raw) {
          const fixed = raw.replace(/\]\[/g, ',');
          comments = JSON.parse(fixed);
        }
      } catch (innerErr) {
        logError('Failed to fetch comments with fallback', innerErr);
      }
    }

    const rabbitComments = comments
      .filter(c => isCodeRabbitUser(c.user?.login))
      .filter(c => {
        if (!latestReviewTimestamp || !c.created_at) return true;
        return new Date(c.created_at) >= latestReviewTimestamp;
      });

    let inlineSummary = '';
    if (rabbitComments.length > 0) {
      const formatComments = (list) => list.map(c => `### ${c.path}:${c.line || '?'} \n${c.body}`).join('\n\n---\n\n');

      if (rabbitComments.length > CONFIG.CODERABBIT_COMMENT_LIMIT) {
        inlineSummary = "\n\n### 🐰 CodeRabbit Inline Comments (Summary)\n\n(Showing top " + CONFIG.CODERABBIT_COMMENT_LIMIT + " of " + rabbitComments.length + " comments)\n" +
          formatComments(rabbitComments.slice(0, CONFIG.CODERABBIT_COMMENT_LIMIT)) +
          "\n\n...(and " + (rabbitComments.length - CONFIG.CODERABBIT_COMMENT_LIMIT) + " more)";
      } else {
        inlineSummary = "\n\n### 🐰 CodeRabbit Inline Comments\n\n" + formatComments(rabbitComments);
      }
    }

    const fullFeedback = (reviewSummary + inlineSummary).trim();
    // Return null if empty to simplify checks later
    return fullFeedback.length > 0 ? fullFeedback : null;
  } catch (e) {
    logError('Failed to fetch CodeRabbit feedback', e);
    return null;
  }
}

/**
 * Get Codecov status for a specific commit.
 * @param {string} repo - Repository in owner/name format
 * @param {string} sha - Commit SHA
 * @returns {string} Formatted Codecov status or empty string
 */
function getCodecovStatus(repo, sha) {
  try {
    const statusesJSON = exec(`gh api "/repos/${repo}/commits/${sha}/statuses" --per-page 100`);
    if (!statusesJSON) return '';
    
    const statuses = JSON.parse(statusesJSON);
    const codecov = statuses.find(s => s.context && s.context.toLowerCase().includes('codecov'));
    
    if (codecov && (codecov.state === 'failure' || codecov.description?.toLowerCase().includes('coverage'))) {
      const icon = codecov.state === 'success' ? '✅' : '❌';
      return `\n\n**Codecov Report**\n${icon} ${codecov.description || 'No description'}\n[View Details](${codecov.target_url})`;
    }
  } catch (e) {
    logError('Failed to fetch Codecov status', e);
  }
  return '';
}

/**
 * Format failed jobs from a workflow run.
 * @param {Object} jobs - Jobs object from GitHub API
 * @returns {string} Formatted list of failed jobs or empty string
 */
function formatFailedJobs(jobs) {
  if (!jobs?.jobs) return '';
  
  return jobs.jobs
    .filter(j => j.conclusion === 'failure')
    .map(j => {
      const failedSteps = j.steps?.filter(s => s.conclusion === 'failure').map(s => s.name).join(', ') || 'Unknown step';
      return `- **${j.name}**: ${failedSteps}`;
    }).join('\n');
}

/**
 * Get truncated failure logs for a workflow run.
 * @param {string} repo - Repository in owner/name format
 * @param {number} runId - Workflow run ID
 * @returns {string} Truncated log output
 */
function getFailureLogs(repo, runId) {
  try {
    let logOutput = exec(`gh run view ${runId} --repo ${repo} --log-failed`);
    if (logOutput.length > CONFIG.LOG_TRUNCATE_LENGTH) {
      logOutput = logOutput.slice(0, CONFIG.LOG_TRUNCATE_LENGTH) + '\n... (truncated)';
    }
    return logOutput;
  } catch (e) {
    return '';
  }
}

function getCIFailures(repo, sha) {
  try {
    const runsJSON = exec(`gh api "/repos/${repo}/actions/runs?head_sha=${sha}&status=completed&conclusion=failure" --jq '.workflow_runs[0]'`);
    if (!runsJSON) return '';
    
    const runsData = JSON.parse(runsJSON);
    if (!runsData || !runsData.id) return '';
    
    const runId = runsData.id;
    const jobsJSON = exec(`gh api "/repos/${repo}/actions/runs/${runId}/jobs" --paginate`);
    if (!jobsJSON) return '';
    
    const jobs = JSON.parse(jobsJSON);
    const failed = formatFailedJobs(jobs);
    if (!failed) return '';

    const logOutput = getFailureLogs(repo, runId);
    const codecovSection = getCodecovStatus(repo, sha);

    return `### 🚨 CI Failure (Run #${runId})\n\n**Failed Jobs:**\n${failed}\n\n**Logs:**\n\n\`\`\`text\n${logOutput}\n\`\`\`${codecovSection}`;
  } catch (e) {
    logError('Failed to fetch CI failures', e);
    return '';
  }
}

function areChecksInProgress(repo, sha, namePattern) {
  if (!sha || !namePattern) return false;
  try {
    const runs = JSON.parse(exec(`gh api "/repos/${repo}/commits/${sha}/check-runs" --jq '.check_runs'`));
    const running = runs.filter(c => 
      c.name.toLowerCase().includes(namePattern.toLowerCase()) && 
      (c.status === 'in_progress' || c.status === 'queued')
    );
    
    return running.length > 0;
  } catch (e) {
    return false;
  }
}

// =============================================================================
// MAIN LOGIC
// =============================================================================

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    throw new Error('GITHUB_EVENT_PATH not found');
  }

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const eventName = process.env.GITHUB_EVENT_NAME;
  const repo = process.env.GITHUB_REPOSITORY;
  
  log(`Analyzing event: ${eventName} (${event.action || 'n/a'})`);

  // ---------------------------------------------------------------------------
  // 1. Context Analysis
  // --------------------------------------------------------------------------- 
  
  let context = {
    isPr: false,
    number: '',
    branch: 'main',
    sha: '',
    author: '',
    labels: [],
    commentBody: '',
    commentAuthor: '',
    reviewAuthor: '',
    reviewBody: '',
    failedJobs: '',
    changedFiles: [],
    prBody: '',
    isDraft: false
  };

  if (eventName === 'pull_request' || eventName === 'pull_request_review') {
    context.isPr = true;
    context.number = event.pull_request.number;
    context.branch = event.pull_request.head.ref;
    context.sha = event.pull_request.head.sha;
    context.author = event.pull_request.user.login;
    context.labels = event.pull_request.labels.map(l => l.name);
    context.prBody = event.pull_request.body;
    context.isDraft = event.pull_request.draft || false;

    // IMMEDIATE LOOP EXIT
    if (context.labels.includes('jules-stuck')) {
        log('Supervisor aborted: PR is labeled jules-stuck');
        process.exit(0);
    }
    
    if (eventName === 'pull_request_review') {
      context.reviewAuthor = event.review.user.login;
      context.reviewBody = event.review.body;
      context.sha = event.review.commit_id; 
    }
  } else if (eventName === 'pull_request_review_comment') {
    // IGNORE: We rely on 'pull_request_review' (submitted) to avoid event storms from batched inline comments.
    // This block is kept in case the YAML trigger is re-added, but we explicitly exit early for CodeRabbit.
    const commentAuthor = event.comment.user.login;
    if (isCodeRabbitUser(commentAuthor)) {
       log('Ignoring pull_request_review_comment from CodeRabbit (waiting for review submit)');
       process.exit(0);
    }

    context.isPr = true;
    context.number = event.pull_request.number;
    context.branch = event.pull_request.head.ref;
    context.sha = event.pull_request.head.sha;
    context.author = event.pull_request.user.login;
    context.labels = event.pull_request.labels.map(l => l.name);
    context.prBody = event.pull_request.body;
    context.isDraft = event.pull_request.draft || false;
    context.reviewAuthor = commentAuthor;
    context.reviewBody = event.comment.body;

  } else if (eventName === 'issue_comment') {
    context.number = event.issue.number;
    context.author = event.issue.user.login;
    context.labels = event.issue.labels.map(l => l.name);
    context.commentBody = event.comment.body;
    context.commentAuthor = event.comment.user.login;

    // IMMEDIATE LOOP EXIT
    if (context.labels.includes('jules-stuck')) {
        log('Supervisor aborted: Issue is labeled jules-stuck');
        process.exit(0);
    }
    
    if (event.issue.pull_request) {
      context.isPr = true;
      try {
        const prData = JSON.parse(exec(`gh pr view ${context.number} --json body,headRefName,headRefOid,author,labels,isDraft --repo ${repo}`));
        context.branch = prData.headRefName;
        context.sha = prData.headRefOid;
        context.author = prData.author.login;
        context.labels = prData.labels.map(l => l.name);
        context.prBody = prData.body;
        context.isDraft = prData.isDraft;
      } catch (e) {
        log('Failed to fetch PR details');
      }
    }

  } else if (eventName === 'issues') {
    context.number = event.issue.number;
    context.author = event.issue.user.login;
    context.labels = event.issue.labels.map(l => l.name);

  } else if (eventName === 'workflow_run') {
    const sha = event.workflow_run.head_sha;
    context.sha = sha;
    const runId = event.workflow_run.id;
    const conclusion = event.workflow_run.conclusion;
    
    try {
      const prs = JSON.parse(exec(`gh api "/repos/${repo}/commits/${sha}/pulls" --header "X-GitHub-Api-Version: 2022-11-28"`));
      
      if (prs.length > 0) {
        const pr = prs[0];
        context.isPr = true;
        context.number = pr.number;
        context.branch = pr.head.ref;
        context.author = pr.user.login;
        context.labels = pr.labels.map(l => l.name);
        context.prBody = pr.body;
        context.isDraft = pr.draft || false;
        
        log(`Linked workflow_run to PR #${context.number} (Draft: ${context.isDraft})`);

        if (conclusion === 'failure') {
          log(`CI workflow failed. Fetching job details for run #${runId}`);
          const jobsJSON = exec(`gh api "/repos/${repo}/actions/runs/${runId}/jobs" --paginate`);
          if (jobsJSON) {
            const jobs = JSON.parse(jobsJSON);
            const failed = formatFailedJobs(jobs);
            
            if (failed) {
              log(`Found failed jobs: ${failed.substring(0, 100)}...`);
              const link = `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${runId}`;
              const logOutput = getFailureLogs(repo, runId);
              const codecovSection = getCodecovStatus(repo, sha);
              
              const codeBlock = "```";
              context.failedJobs = `### 🚨 CI Failure\n\n**Failed Jobs:**\n${failed}\n\n**Logs:**\n${codeBlock}text\n${logOutput}\n${codeBlock}${codecovSection}\n\n[View Full Log](${link})`;
            }
          }
          if (!context.failedJobs) {
            const link = `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${runId}`;
            context.failedJobs = `### 🚨 CI Failure\n\nThe CI workflow failed, but detailed job logs were unavailable.\n\n[View Full Log](${link})`;
          }
        }
      }
    } catch (e) {
      logError('Failed to process workflow_run event', e);
    }
  }

  // Fetch changed files
  if (context.isPr && context.number) {
    try {
      context.changedFiles = exec(`gh pr view ${context.number} --json files --jq '.files[].path'`).split('\n');
    } catch (e) {}
  }

  log(`Context: PR=${context.isPr}, #${context.number}, Author=${context.author}`);

  // ---------------------------------------------------------------------------
  // 2. Prepare Context Injection
  // ---------------------------------------------------------------------------
  let projectContext = '';
  try {
    const agentsDoc = fs.existsSync('AGENTS.md') ? fs.readFileSync('AGENTS.md', 'utf8') : '';
    const conventions = fs.existsSync('.agent/context/conventions.md') ? fs.readFileSync('.agent/context/conventions.md', 'utf8') : '';
    projectContext = `
## 🛡️ CRITICAL PROJECT RULES (Must Follow)
${agentsDoc}

## 📏 CODING CONVENTIONS
${conventions}
`;
  } catch (e) {
    log('Warning: Could not read context files');
  }

  const getContextualPrompt = (filename, extraReplacements = {}) => {
    return getPrompt(filename, {
      ...extraReplacements,
      PROJECT_CONTEXT: projectContext,
      PR_BODY: context.prBody || '',
      NUMBER: context.number,
      BRANCH: context.branch,
      AUTHOR: context.author
    });
  };

  // ---------------------------------------------------------------------------
  // 3. Smart Triage
  // ---------------------------------------------------------------------------
  
  if (context.number) {
    let newLabels = [];
    if (eventName === 'issues' && event.action === 'opened') {
      const text = `${event.issue.title} ${event.issue.body}`.toLowerCase();
      if (text.match(/bug|error|crash|fail/)) newLabels.push('bug');
      if (text.match(/feature|add|create|new/)) newLabels.push('enhancement');
      if (text.match(/doc|readme|guide/)) newLabels.push('documentation');
    }
    if (context.isPr && context.changedFiles.length > 0) {
      const files = context.changedFiles.join(' ');
      if (files.match(/drizzle|db|schema|migration/)) newLabels.push('area/database');
      if (files.match(/components|ui|app|css|tailwind/)) newLabels.push('area/ui');
      if (files.match(/tests|spec|e2e/)) newLabels.push('area/testing');
      if (files.match(/\.github|workflow/)) newLabels.push('area/devops');
      if (files.match(/docs|md/)) newLabels.push('documentation');
    }
    newLabels = [...new Set(newLabels)].filter(l => !context.labels.includes(l));
    if (newLabels.length > 0) await addLabels(context.number, newLabels);
  }

  // ---------------------------------------------------------------------------
  // 4. Decision Logic
  // ---------------------------------------------------------------------------
  
  let decision = {
    method: 'none',
    prompt: '',
    batchedComments: '',
    shouldTriggerCodeRabbit: 'false',
    reason: ''
  };

  const authorLower = normalizeLogin(context.author);
  const reviewAuthorLower = normalizeLogin(context.reviewAuthor);
  
  function getStandardMethod() {
    if (authorLower === 'google-labs-jules' || authorLower === 'jules' || authorLower.includes('google-labs-jules')) {
      return { method: 'mention', reason: 'Jules PR' };
    }
    if (authorLower === 'renovate[bot]') {
      if (context.labels.includes('jules-invoked')) return { method: 'mention', reason: 'Renovate (Existing)' };
      return { method: 'api', reason: 'Renovate (First Run)' };
    }
    return { method: 'api', reason: 'Human Author' };
  }

  function isLooping() {
    try {
        const attemptCount = getAttemptCount(context.labels);
        if (attemptCount >= CONFIG.LOOP_THRESHOLD) {
            log(`Loop detected: Attempt count ${attemptCount} exceeds threshold.`);
            return true;
        }
        const commits = JSON.parse(exec(`gh pr view ${context.number} --json commits --jq '[.commits[].authors[0].login] | reverse | .[0:3]'`));
        const isJules = c => c && (c.includes('jules') || c.includes('google-labs'));
        if (commits.length >= 3 && commits.every(isJules)) {
            return true;
        }

        // Check if the last comment is already a bot/supervisor instruction
        const lastComments = JSON.parse(exec(`gh api "/repos/${repo}/issues/${context.number}/comments?per_page=5&sort=created&direction=desc"`));
        if (lastComments && lastComments.length > 0) {
            const lastComment = lastComments[0];
            const isBot = isBotUser(lastComment.user?.login);
            const hasSignature = lastComment.body.includes('Routing via Trigger') ||
                                 lastComment.body.includes('Jules Session Starting') ||
                                 lastComment.body.includes('Loop Detected') ||
                                 lastComment.body.includes(CONFIG.SIGNATURE_PREFIX);

            // If the last comment is from the PAT user (who might look like a human) but contains our signature, treat it as a loop
            if (hasSignature) {
                log('Loop detected: Last comment was a Supervisor instruction.');
                return true;
            }
        }
    } catch(e) {}
    return false;
  }

  // --- A: Commands & Mentions ---
  if (eventName === 'issue_comment') {
    const body = context.commentBody.trim();
    const commenter = context.commentAuthor;
    const commenterLower = normalizeLogin(commenter);

    // Updated Bot Detection Logic
    const isBot = isBotUser(commenterLower) ||
                  body.includes('Routing via Trigger') ||
                  body.includes(CONFIG.SIGNATURE_PREFIX);
    
    if (!isBot && (body.includes('@jules') || body.includes('@google-labs-jules') || body.includes('@src/lib/jules-client.ts'))) {
      const standard = getStandardMethod();
      decision.reason = 'Manual interaction';
      
      let cmdPrompt = 'manual-pr.md';
      if (body.includes('/refactor')) cmdPrompt = 'cmd-refactor.md';
      else if (body.includes('/test')) cmdPrompt = 'cmd-test.md';
      else if (body.includes('/explain')) cmdPrompt = 'cmd-explain.md';
      else if (!context.isPr) cmdPrompt = 'manual-issue.md';

      if (standard.method === 'api') {
        decision.method = 'api';
        decision.prompt = getContextualPrompt(cmdPrompt, {
          COMMENT_BODY: body,
          COMMENT_AUTHOR: commenter
        });
        decision.reason = `Command: ${cmdPrompt.replace('.md', '')}`;
      } else {
        decision.method = 'mention'; 
      }
    } else if (isBot) {
        log(`Ignoring comment from bot or self: ${commenter}`);
    }
  }

  // --- B: CI Failure (Enhanced with CodeRabbit) ---
  else if (context.failedJobs) {
    if (isLooping()) {
      log('Loop detected. Aborting CI fix.');
      decision.method = 'none';
      decision.reason = 'Loop Protection';
      exec(`gh pr comment ${context.number} --body "⚠️ **Loop Detected**: Jules has attempted to fix this PR 3 times without success. Pausing to allow human intervention."`);
      await addLabels(context.number, ['jules-stuck']);
    } else if (context.isDraft) {
      log('PR is Draft. Skipping CI auto-fix.');
      decision.method = 'none';
      decision.reason = 'Draft PR';
    } else {
      let isJulesInvolved = authorLower.includes('jules') || authorLower.includes('google-labs');
      if (!isJulesInvolved) {
        try {
          const commitAuthors = JSON.parse(exec(`gh pr view ${context.number} --json commits --jq '[.commits[].authors[0].login]'`));
          isJulesInvolved = commitAuthors.some(a => a && (a.toLowerCase().includes('jules') || a.toLowerCase().includes('google-labs')));
        } catch (e) {}
      }

      const rabbitInProgress = areChecksInProgress(repo, context.sha, 'coderabbit');
      const rabbitFeedback = getCodeRabbitFeedback(repo, context.number);
      const rabbitNote = rabbitInProgress
        ? "\n\n⚠️ CodeRabbit review is still running. Additional feedback may arrive after this CI report."
        : '';
      const combinedFeedback = context.failedJobs + (rabbitFeedback ? "\n\n---\n\n" + rabbitFeedback : "") + rabbitNote;

      if (isJulesInvolved) {
        // Jules PR: Use @jules mention (free, Jules responds when it has commits on the PR)
        decision.method = 'mention';
        decision.batchedComments = combinedFeedback;
        decision.reason = 'CI Failure (Jules PR)';
        log('Using @jules mention for CI failure (Jules is involved)');
      } else {
        // Human PR: Use API to invoke Jules with full context
        decision.method = 'api';
        decision.prompt = getContextualPrompt('ci-failure.md', {
          FAILED_JOBS: combinedFeedback,
          PR_NUMBER: context.number
        });
        decision.reason = 'CI Failure (Human PR)';
        log('Using Jules API for CI failure (human PR)');
      }
    }
  }

  // --- C: Automated Review (Enhanced with CI) ---
  else if ((eventName === 'pull_request_review' || eventName === 'pull_request_review_comment') &&
          (isCodeRabbitUser(reviewAuthorLower) || isCodecovUser(reviewAuthorLower))) {
    if (context.isDraft) {
      decision.method = 'none';
      decision.reason = 'Draft PR (Review ignored)';
    } else {
      try {
        const rabbitFeedback = getCodeRabbitFeedback(repo, context.number);
        
        // BATCHING: Include CI failures if available
        let ciFeedback = '';
        if (context.sha) {
          ciFeedback = getCIFailures(repo, context.sha);
        }
        const ciPending = areChecksInProgress(repo, context.sha, 'CI');
        const ciNote = ciPending
          ? "\n\n⚠️ CI is still running. Results may change after completion."
          : '';

        const combinedFeedback = (rabbitFeedback || '') + (ciFeedback ? "\n\n---\n\n" + ciFeedback : "") + ciNote;

        if (combinedFeedback.trim()) {
          const standard = getStandardMethod();
          decision.method = standard.method;
          decision.batchedComments = combinedFeedback;
          decision.reason = 'Review + CI Feedback';
          if (decision.method === 'api') {
            decision.prompt = getContextualPrompt(context.author === 'renovate[bot]' ? 'renovate-review.md' : 'code-rabbit-review.md', {
              BATCHED_COMMENTS: combinedFeedback
            });
          }
        } else {
          // No actionable feedback found
          log('No actionable feedback found from review.');
          decision.method = 'none';
          decision.reason = 'No Actionable Feedback';
        }
      } catch (e) {}
    }
  }

  // --- D: Label Trigger ---
  else if (eventName === 'issues' && event.action === 'labeled' && event.label.name === 'jules') {
    decision.method = 'api';
    decision.prompt = getContextualPrompt('manual-issue.md', {
      ISSUE_TITLE: event.issue.title,
      ISSUE_BODY: event.issue.body
    });
    decision.reason = 'Issue labeled jules';
  }

  // --- E: Human Changes Requested ---
  else if (eventName === 'pull_request_review' && event.review.state === 'changes_requested' && !reviewAuthorLower.includes('bot') && !isCodeRabbitUser(reviewAuthorLower)) {
    if (context.isDraft) {
        decision.method = 'none';
        decision.reason = 'Draft PR (Human review ignored)';
    } else {
        const standard = getStandardMethod();
        decision.method = standard.method;
        decision.reason = 'Human requested changes';
        if (decision.method === 'api') {
            decision.prompt = getContextualPrompt('human-review.md', {
                REVIEW_AUTHOR: context.reviewAuthor,
                REVIEW_BODY: context.reviewBody
            });
        }
    }
  }

  // --- F: CodeRabbit Trigger ---
  if (context.isPr && eventName === 'workflow_run' && event.workflow_run.conclusion === 'success') {
     if (authorLower.includes('bot') || authorLower === 'google-labs-jules') {
        decision.shouldTriggerCodeRabbit = 'true';
     }
  }

  // ---------------------------------------------------------------------------
  // 5. Output
  // ---------------------------------------------------------------------------

  // NOTE: Always use @jules - this is the trigger that Jules responds to
  // The old code incorrectly used '@src/lib/jules-client.ts' which is a FILE PATH, not a mention!
  const assigneeMention = '@jules';
  const signature = buildSignature(context, decision);

  // DUPLICATE CHECK & POSTING LOGIC
  // Before finalizing, check if we are posting a duplicate feedback comment
  if (decision.batchedComments) {
      // PREPEND MENTION if not already present
      // We check for assigneeMention, or any other variation
      if (!decision.batchedComments.includes('@jules') && !decision.batchedComments.includes('@google-labs-jules')) {
          decision.batchedComments = `${assigneeMention}\n\n${decision.batchedComments}`;
      }

      // Append signature
      decision.batchedComments += `\n\n${signature}`;

      // Check if the exact feedback was already posted recently
      try {
          const comments = JSON.parse(exec(`gh api "/repos/${repo}/issues/${context.number}/comments?per_page=5&sort=created&direction=desc"`));
          const botComments = comments.filter(c => isBotUser(c.user?.login) || c.body.includes(CONFIG.SIGNATURE_PREFIX));

          if (botComments.length > 0) {
              const lastBody = botComments[0].body;
              // Check if the significant part of the new comment is present in the last one
              // We remove the signature for comparison if needed, or just search substring
              // The new comment is `decision.batchedComments`.
              // `lastBody` might contain other text.

              // Simple check: does lastBody contain the bulk of the feedback?
              // Let's strip the signature and mention from decision.batchedComments for the search
              const rawFeedback = decision.batchedComments
                  .replace(signature, '')
                  .replace(assigneeMention, '')
                  .trim();

              if (rawFeedback.length > 20 && lastBody.includes(rawFeedback)) {
                  log('Duplicate feedback detected. Skipping repost.');
                  decision.method = 'none';
                  decision.reason = 'Duplicate Feedback';
                  // Clear batchedComments to prevent empty posting downstream
                  decision.batchedComments = '';
              }
          }
      } catch(e) {
          // ignore
      }
  } else {
      // If there are no batched comments, ensure we don't accidentally post an empty or generic message
      // when the intention was to report feedback.
      if (decision.reason.includes('Feedback') || decision.reason.includes('Failure')) {
          log('No actionable feedback content found. Aborting post to avoid spam.');
          decision.method = 'none';
          decision.reason = 'Empty Feedback';
      }
  }

  log(`Final Decision: ${decision.method} (${decision.reason})`);

  if (context.isPr && decision.method !== 'none') {
    const shouldCountAttempt = decision.reason.includes('CI Failure') || decision.reason.includes('Review');
    if (shouldCountAttempt) {
      await incrementAttemptLabel(context.number, context.labels);
    }
  }

  setOutput('is_pr', context.isPr.toString());
  setOutput('number', context.number.toString());
  setOutput('branch', context.branch);
  setOutput('author', context.author);
  setOutput('labels', context.labels.join(','));
  setOutput('invocation_method', decision.method);
  setOutput('jules_prompt', decision.prompt);
  setOutput('batched_comments', decision.batchedComments);
  setOutput('should_trigger_coderabbit', decision.shouldTriggerCodeRabbit);
  setOutput('assignee_mention', assigneeMention);

  if (process.env.GITHUB_STEP_SUMMARY) {
    // Calculate metrics
    const filesChanged = context.changedFiles?.length || 0;
    const labelsCount = context.labels?.length || 0;
    const hasCIFailure = !!context.failedJobs;
    const isBotPR = authorLower.includes('bot') || authorLower.includes('jules') || authorLower.includes('renovate');
    
    // Decision flow path
    const decisionPath = [];
    if (eventName === 'workflow_run') decisionPath.push('Workflow Run');
    else if (eventName === 'pull_request_review') decisionPath.push('PR Review');
    else if (eventName === 'pull_request_review_comment') decisionPath.push('PR Review Comment');
    else if (eventName === 'issue_comment') decisionPath.push('Comment');
    else if (eventName === 'pull_request') decisionPath.push('PR Event');
    else if (eventName === 'issues') decisionPath.push('Issue Event');
    
    if (context.isPr) decisionPath.push('PR Context');
    else decisionPath.push('Issue Context');
    
    if (hasCIFailure) decisionPath.push('CI Failed');
    if (context.isDraft) decisionPath.push('Draft PR');
    decisionPath.push(decision.reason || 'No Action');
    
    // Cost indicator
    const costIndicator = decision.method === 'api' ? '💰 API Call' : 
                          decision.method === 'mention' ? '✨ Free Mention' : 
                          '⏸️ No Cost';
    
    // Status emoji
    const statusEmoji = decision.method === 'api' ? '🚀' : 
                        decision.method === 'mention' ? '💬' : 
                        '⏹️';

    const summary = `## ${statusEmoji} Agentic Supervisor Dashboard (v4.8)

### 📊 Event Summary

| Metric | Value |
|:-------|:------|
| **Event Type** | \`${eventName}\` |
| **Action** | \`${event.action || 'N/A'}\` |
| **Target** | ${context.isPr ? `PR #${context.number}` : context.number ? `Issue #${context.number}` : 'N/A'} |
| **Author** | \`${context.author || 'N/A'}\` ${isBotPR ? '🤖' : '👤'} |
| **Branch** | \`${context.branch || 'N/A'}\` |
| **Draft** | ${context.isDraft ? '✅ Yes' : '❌ No'} |
| **Files Changed** | ${filesChanged} |
| **Labels** | ${labelsCount > 0 ? context.labels.map(l => '`' + l + '`').join(', ') : 'None'} |

### 🎯 Decision

| | |
|:--|:--|
| **Method** | **${decision.method.toUpperCase()}** ${statusEmoji} |
| **Reason** | ${decision.reason || 'None'} |
| **Cost** | ${costIndicator} |
| **CodeRabbit Trigger** | ${decision.shouldTriggerCodeRabbit === 'true' ? '✅ Yes' : '❌ No'} |

### 🔄 Decision Flow

\`\`\`mermaid
flowchart LR
    A[${eventName}] --> B{PR or Issue?}
    B --> |${context.isPr ? 'PR' : 'Issue'}| C{Author Type}
    C --> |${isBotPR ? 'Bot' : 'Human'}| D{CI Status}
    D --> |${hasCIFailure ? 'Failed' : 'OK'}| E[${decision.method.toUpperCase()}]
    style E fill:${decision.method === 'api' ? '#f9a825' : decision.method === 'mention' ? '#4caf50' : '#9e9e9e'}
\`\`\`

### 📈 Quick Stats

| Indicator | Status |
|:----------|:-------|
| CI Failure Detected | ${hasCIFailure ? '🔴 Yes' : '🟢 No'} |
| Bot Author | ${isBotPR ? '🤖 Yes' : '👤 No'} |
| Jules Involved | ${authorLower.includes('jules') || authorLower.includes('google-labs') ? '✅' : '❌'} |
| Loop Risk | ${context.labels?.includes('jules-stuck') ? '⚠️ HIGH' : '✅ Low'} |

---

<details>
<summary>📝 Debug Info (click to expand)</summary>

**Decision Path:** ${decisionPath.join(' → ')}

**Context Object:**
\`\`\`json
${JSON.stringify({
  isPr: context.isPr,
  number: context.number,
  author: context.author,
  branch: context.branch,
  isDraft: context.isDraft,
  labelsCount: context.labels?.length,
  filesChangedCount: context.changedFiles?.length,
  hasCIFailure: !!context.failedJobs
}, null, 2)}
\`\`\`

**Decision Object:**
\`\`\`json
${JSON.stringify({
  method: decision.method,
  reason: decision.reason,
  shouldTriggerCodeRabbit: decision.shouldTriggerCodeRabbit,
  hasPrompt: !!decision.prompt,
  hasBatchedComments: !!decision.batchedComments
}, null, 2)}
\`\`\`

</details>
`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
