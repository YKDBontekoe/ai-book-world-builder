const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * AGENTIC SUPERVISOR (v4.3)
 * 
 * Centralized orchestration for AI agents.
 * Features:
 * - Batched Feedback (CI + Codecov + CodeRabbit)
 * - Synchronized Execution (Waits for all signals)
 * - Author-based Invocation Strategy (Hybrid)
 * - Smart Auto-Triage & Labeling
 * - Infinite Loop Protection
 */

// =============================================================================
// HELPERS
// =============================================================================

function log(msg) {
  console.log(`[Supervisor] ${msg}`);
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

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return '';
  }
}

function getPrompt(filename, replacements = {}) {
  try {
    let content = fs.readFileSync(`.github/prompts/${filename}`, 'utf8');
    for (const [key, val] of Object.entries(replacements)) {
      content = content.replace(new RegExp(`\$${key}`, 'g'), val || '');
    }
    return content;
  } catch (e) {
    log(`Warning: Prompt file ${filename} not found.`);
    return '';
  }
}

async function addLabels(number, labels) {
  if (!labels || labels.length === 0) return;
  const labelStr = labels.join(',');
  log(`Adding labels: ${labelStr}`);
  try {
    exec(`gh issue edit ${number} --add-label "${labelStr}"`);
  } catch (e) {
    log(`Failed to add labels: ${e.message}`);
  }
}

// --- Batched Feedback Helpers ---

function getCodeRabbitComments(repo, number) {
  try {
    const commentsJSON = exec(`gh api "/repos/${repo}/pulls/${number}/comments"`);
    const comments = JSON.parse(commentsJSON);
    const rabbitComments = comments.filter(c => c.user?.login?.includes('coderabbitai'));
    
    if (rabbitComments.length === 0) return '';
    
    const formatComments = (list) => list.map(c => `### ${c.path}:${c.line || '?'} \n${c.body}`).join('\n\n---\n\n');
    
    let summary = '';
    if (rabbitComments.length > 10) {
      summary = "### 🐰 CodeRabbit Review (Summary)\n\n(Showing top 10 of " + rabbitComments.length + " comments)\n" + 
             formatComments(rabbitComments.slice(0, 10)) + 
             "\n\n...(and " + (rabbitComments.length - 10) + " more)";
    } else {
      summary = "### 🐰 CodeRabbit Review\n\n" + formatComments(rabbitComments);
    }
    return summary;
  } catch (e) {
    log(`Failed to fetch CodeRabbit comments: ${e.message}`);
    return '';
  }
}

function getCIFailures(repo, sha) {
  try {
    const runsData = JSON.parse(exec(`gh api "/repos/${repo}/actions/runs?head_sha=${sha}&status=completed&conclusion=failure" --jq '.workflow_runs[0]'`));
    if (!runsData || !runsData.id) return '';
    
    const runId = runsData.id;
    const jobs = JSON.parse(exec(`gh api "/repos/${repo}/actions/runs/${runId}/jobs" --paginate`));
    const failed = jobs.jobs
      .filter(j => j.conclusion === 'failure')
      .map(j => {
         const failedSteps = j.steps.filter(s => s.conclusion === 'failure').map(s => s.name).join(', ');
         return `- **${j.name}**: ${failedSteps}`;
      }).join('\n');
      
    if (!failed) return '';

    let logOutput = '';
    try {
        logOutput = exec(`gh run view ${runId} --repo ${repo} --log-failed`);
        if (logOutput.length > 2000) logOutput = logOutput.slice(0, 2000) + '\n... (truncated)';
    } catch (e) {}
    
    let codecovSection = '';
    try {
       const statuses = JSON.parse(exec(`gh api "/repos/${repo}/commits/${sha}/statuses" --per-page 100`));
       const codecov = statuses.find(s => s.context && s.context.toLowerCase().includes('codecov'));
       if (codecov && (codecov.state === 'failure' || codecov.description.toLowerCase().includes('coverage'))) {
          const icon = codecov.state === 'success' ? '✅' : '❌';
          codecovSection = `\n\n**Codecov Report**\n${icon} ${codecov.description}\n[View Details](${codecov.target_url})`;
       }
    } catch (e) {}

    return `### 🚨 CI Failure (Run #${runId})\n\n**Failed Jobs:**\n${failed}\n\n**Logs:**\n\
```text\n${logOutput}\n\
```${codecovSection}`;
  } catch (e) {
    log(`Failed to fetch CI failures: ${e.message}`);
    return '';
  }
}

function areChecksInProgress(repo, sha, namePattern) {
  try {
    const runs = JSON.parse(exec(`gh api "/repos/${repo}/commits/${sha}/check-runs" --jq '.check_runs'`));
    // Filter for checks matching the pattern AND (in_progress or queued)
    // Exclude self if possible? (If we are running this script inside a check run...)
    // But this script runs in a workflow job. Check runs are usually per-job or per-app.
    const running = runs.filter(c => 
      c.name.toLowerCase().includes(namePattern.toLowerCase()) && 
      (c.status === 'in_progress' || c.status === 'queued')
    );
    
    return running.length > 0;
  } catch (e) {
    // If API fails, assume NOT in progress to avoid deadlock, unless it's critical?
    // Safer to assume false so we don't hang forever.
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
    
    if (eventName === 'pull_request_review') {
      context.reviewAuthor = event.review.user.login;
      context.reviewBody = event.review.body;
      context.sha = event.review.commit_id; 
    }

  } else if (eventName === 'issue_comment') {
    context.number = event.issue.number;
    context.author = event.issue.user.login;
    context.labels = event.issue.labels.map(l => l.name);
    context.commentBody = event.comment.body;
    context.commentAuthor = event.comment.user.login;
    
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
             const jobs = JSON.parse(exec(`gh api "/repos/${repo}/actions/runs/${runId}/jobs" --paginate`));
             const failed = jobs.jobs
              .filter(j => j.conclusion === 'failure')
              .map(j => {
                const failedSteps = j.steps.filter(s => s.conclusion === 'failure').map(s => s.name).join(', ');
                return `- **${j.name}**: ${failedSteps}`;
              }).join('\n');
            
            if (failed) {
              const link = `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${runId}`;
              let logOutput = '';
              try {
                  logOutput = exec(`gh run view ${runId} --repo ${repo} --log-failed`);
                  if (logOutput.length > 2000) logOutput = logOutput.slice(0, 2000) + '\n... (truncated)';
              } catch (e) {}
              
              let codecovSection = '';
              try {
                const statuses = JSON.parse(exec(`gh api "/repos/${repo}/commits/${sha}/statuses" --per-page 100`));
                const codecov = statuses.find(s => s.context && s.context.toLowerCase().includes('codecov'));
                if (codecov && (codecov.state === 'failure' || codecov.description.toLowerCase().includes('coverage'))) {
                   const icon = codecov.state === 'success' ? '✅' : '❌';
                   codecovSection = `\n\n**Codecov Report**\n${icon} ${codecov.description}\n[View Details](${codecov.target_url})`;
                }
              } catch (e) {}
              
              context.failedJobs = `### 🚨 CI Failure\n\n**Failed Jobs:**\n${failed}\n\n**Logs:**\n\
```text\n${logOutput}\n\
```${codecovSection}\n\n[View Full Log](${link})`;
            }
        }
      }
    } catch (e) {}
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

  const authorLower = (context.author || '').toLowerCase();
  
  function getStandardMethod() {
    if (authorLower === 'google-labs-jules' || authorLower === 'jules' || authorLower.startsWith('google-labs-jules')) {
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
        const commits = JSON.parse(exec(`gh pr view ${context.number} --json commits --jq '[.commits[].authors[0].login] | reverse | .[0:3]'`));
        const isJules = c => c && (c.includes('jules') || c.includes('google-labs'));
        if (commits.length >= 3 && commits.every(isJules)) {
            return true;
        }
    } catch(e) {}
    return false;
  }

  // --- A: Commands & Mentions ---
  if (eventName === 'issue_comment') {
    const body = context.commentBody.trim();
    const commenter = context.commentAuthor;
    
    if (commenter !== 'github-actions[bot]' && commenter !== 'google-labs-jules' && body.includes('@jules')) {
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
    }
  }

  // --- B: CI Failure (Enhanced with CodeRabbit) ---
  else if (context.failedJobs) {
    if (areChecksInProgress(repo, context.sha, 'coderabbit')) {
        log('CodeRabbit is still analyzing. Waiting for review to complete before batching.');
        decision.method = 'none';
        decision.reason = 'Waiting for CodeRabbit';
    } 
    else if (isLooping()) {
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
          } catch(e) {}
      }

      // BATCHING: Include CodeRabbit comments if available
      const rabbitFeedback = getCodeRabbitComments(repo, context.number);
      const combinedFeedback = context.failedJobs + (rabbitFeedback ? "\n\n---\n\n" + rabbitFeedback : "");

      if (isJulesInvolved) {
          decision.method = 'mention';
          decision.batchedComments = combinedFeedback;
          decision.reason = 'CI Failure + Feedback';
      } else {
          // Human PR: Offer help (but don't auto-fix yet)
           try {
              const comments = exec(`gh pr view ${context.number} --json comments --jq '.comments[].body'`);
              if (!comments.includes('Reply with: @jules fix')) {
                  exec(`gh pr comment ${context.number} --body "❌ **CI Checks Failed**\n\nI can attempt to fix these issues automatically.\n\nReply with: 
@jules fix"`);
              }
          } catch (e) {}
          decision.method = 'none';
          decision.reason = 'CI Failure (Human PR)';
      }
    }
  }

  // --- C: Automated Review (Enhanced with CI) ---
  else if (eventName === 'pull_request_review' && 
          (context.reviewAuthor.includes('coderabbitai') || context.reviewAuthor.includes('codecov'))) {
    
    if (areChecksInProgress(repo, context.sha, 'CI')) {
        log('CI is still running. Waiting for completion before batching.');
        decision.method = 'none';
        decision.reason = 'Waiting for CI';
    }
    else if (context.isDraft) {
      decision.method = 'none';
      decision.reason = 'Draft PR (Review ignored)';
    } else {
      try {
        const rabbitFeedback = getCodeRabbitComments(repo, context.number);
        
        // BATCHING: Include CI failures if available
        let ciFeedback = '';
        if (context.sha) {
            ciFeedback = getCIFailures(repo, context.sha);
        }

        const combinedFeedback = (rabbitFeedback || '') + (ciFeedback ? "\n\n---\n\n" + ciFeedback : "");

        if (combinedFeedback) {
          const standard = getStandardMethod();
          decision.method = standard.method;
          decision.batchedComments = combinedFeedback;
          decision.reason = 'Review + CI Feedback';
          if (decision.method === 'api') {
            decision.prompt = getContextualPrompt(context.author === 'renovate[bot]' ? 'renovate-review.md' : 'code-rabbit-review.md', {
              BATCHED_COMMENTS: combinedFeedback
            });
          }
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
  else if (eventName === 'pull_request_review' && event.review.state === 'changes_requested' && !context.reviewAuthor.includes('bot')) {
    if (context.isDraft) {
        decision.method = 'none';
        decision.reason = 'Draft PR (Human review ignored)';
    } else {
        decision.method = 'api';
        decision.prompt = getContextualPrompt('human-review.md', {
        REVIEW_AUTHOR: context.reviewAuthor,
        REVIEW_BODY: context.reviewBody
        });
        decision.reason = 'Human requested changes';
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

  log(`Final Decision: ${decision.method} (${decision.reason})`);

  setOutput('is_pr', context.isPr.toString());
  setOutput('number', context.number.toString());
  setOutput('branch', context.branch);
  setOutput('author', context.author);
  setOutput('labels', context.labels.join(','));
  setOutput('invocation_method', decision.method);
  setOutput('jules_prompt', decision.prompt);
  setOutput('batched_comments', decision.batchedComments);
  setOutput('should_trigger_coderabbit', decision.shouldTriggerCodeRabbit);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const summary = `### 🤖 Jules Supervisor (v4.3)    
    
| Metric | Value |
| :--- | :--- |
| **Context** | ${eventName} |
| **Target** | #${context.number || 'N/A'} |
| **Author** | ${context.author || 'N/A'} |
| **Method** | 
${decision.method}
 |
| **Reason** | ${decision.reason || 'None'} |

${decision.method === 'api' ? '> **API Triggered**' : decision.method === 'mention' ? '> **Mention Triggered**' : '> No Action Taken'}
`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
