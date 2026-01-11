const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * AGENTIC SUPERVISOR (v4.1)
 * 
 * Centralized orchestration for AI agents.
 * Features:
 * - Author-based Invocation Strategy (Hybrid)
 * - Slash Command Support (/refactor, /test, /explain)
 * - Smart Auto-Triage & Labeling
 * - Infinite Loop Protection
 * - Context Injection (AGENTS.md, Renovate Release Notes)
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
    author: '',
    labels: [],
    commentBody: '',
    commentAuthor: '',
    reviewAuthor: '',
    reviewBody: '',
    failedJobs: '',
    changedFiles: [],
    prBody: ''
  };

  if (eventName === 'pull_request' || eventName === 'pull_request_review') {
    context.isPr = true;
    context.number = event.pull_request.number;
    context.branch = event.pull_request.head.ref;
    context.author = event.pull_request.user.login;
    context.labels = event.pull_request.labels.map(l => l.name);
    context.prBody = event.pull_request.body;
    
    if (eventName === 'pull_request_review') {
      context.reviewAuthor = event.review.user.login;
      context.reviewBody = event.review.body;
    }

  } else if (eventName === 'issue_comment') {
    context.number = event.issue.number;
    context.author = event.issue.user.login; // PR author
    context.labels = event.issue.labels.map(l => l.name);
    context.commentBody = event.comment.body;
    context.commentAuthor = event.comment.user.login; // Commenter
    
    if (event.issue.pull_request) {
      context.isPr = true;
      try {
        const prData = JSON.parse(exec(`gh pr view ${context.number} --json body,headRefName,author,labels --repo ${repo}`));
        context.branch = prData.headRefName;
        context.author = prData.author.login;
        context.labels = prData.labels.map(l => l.name);
        context.prBody = prData.body;
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
    const runId = event.workflow_run.id;
    const conclusion = event.workflow_run.conclusion;
    
    try {
      const prs = JSON.parse(exec(`gh api "/repos/${repo}/pulls" --jq "[.[] | select(.head.sha == \"${sha}\")]"`));
      if (prs.length > 0) {
        const pr = prs[0];
        context.isPr = true;
        context.number = pr.number;
        context.branch = pr.head.ref;
        context.author = pr.user.login;
        context.labels = pr.labels.map(l => l.name);
        context.prBody = pr.body;
        
        log(`Linked workflow_run to PR #${context.number}`);

        if (conclusion === 'failure') {
          try {
            const jobs = JSON.parse(exec(`gh api "/repos/${repo}/actions/runs/${runId}/jobs" --paginate`));
            const failed = jobs.jobs
              .filter(j => j.conclusion === 'failure')
              .map(j => {
                const failedSteps = j.steps.filter(s => s.conclusion === 'failure').map(s => s.name).join(', ');
                return `- **${j.name}**: ${failedSteps}`;
              }).join('\n');
            
            if (failed) {
              const link = `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${runId}`;
              let reproduction = '';
              
              if (failed.includes('unit-tests') || failed.includes('test:unit')) {
                reproduction = '\n\n**To Reproduce:**\n```bash\npnpm test:unit\n```';
              } else if (failed.includes('static-checks') || failed.includes('lint')) {
                reproduction = '\n\n**To Reproduce:**\n```bash\npnpm lint && pnpm type-check\n```';
              }
              
              context.failedJobs = `### 🚨 CI Failure\n\n**Failed Jobs:**\n${failed}${reproduction}\n\n[View Log](${link})`;
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  // Fetch changed files for smart triage
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
    const agentsDoc = fs.readFileSync('AGENTS.md', 'utf8');
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

  // --- B: CI Failure ---
  else if (context.failedJobs) {
    if (isLooping()) {
      log('Loop detected. Aborting CI fix.');
      decision.method = 'none';
      decision.reason = 'Loop Protection';
      exec(`gh pr comment ${context.number} --body "⚠️ **Loop Detected**: Jules has attempted to fix this PR 3 times without success. Pausing to allow human intervention."`);
      await addLabels(context.number, ['jules-stuck']);
    } else {
      const standard = getStandardMethod();
      decision.method = standard.method;
      decision.batchedComments = context.failedJobs;
      decision.reason = 'CI Failure';
      if (decision.method === 'api') {
        decision.prompt = `
${projectContext}

## TASK
The CI pipeline failed for PR #${context.number}.

## ERRORS
${context.failedJobs}

## INSTRUCTIONS
1. Analyze the errors above.
2. Fix the code to resolve these specific errors.
3. Ensure no regressions.
`;
      }
    }
  }

  // --- C: Automated Review ---
  else if (eventName === 'pull_request_review' && 
          (context.reviewAuthor.includes('coderabbitai') || context.reviewAuthor.includes('codecov'))) {
    
    try {
      const commentsJSON = exec(`gh api "/repos/${repo}/pulls/${context.number}/comments"`);
      const comments = JSON.parse(commentsJSON);
      
      const rabbitComments = comments.filter(c => c.user?.login?.includes('coderabbitai'));
      
      const formatComments = (list) => list.map(c => `### ${c.path}:${c.line || '?'}\n${c.body}`).join('\n\n---\n\n');

      let finalComments = '';
      if (rabbitComments.length > 15) {
          finalComments = "### Summary of Feedback\n\nThere are many comments. Focus on the high-level themes:\n" + 
                          formatComments(rabbitComments.slice(0, 5)) + 
                          "\n\n...(and " + (rabbitComments.length - 5) + " more)";
      } else {
          finalComments = formatComments(rabbitComments);
      }

      if (finalComments) {
        const standard = getStandardMethod();
        decision.method = standard.method;
        decision.batchedComments = finalComments;
        decision.reason = 'Review comments batched';
        if (decision.method === 'api') {
          decision.prompt = getContextualPrompt(context.author === 'renovate[bot]' ? 'renovate-review.md' : 'code-rabbit-review.md', {
            BATCHED_COMMENTS: finalComments
          });
        }
      }
    } catch (e) {}
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
    decision.method = 'api';
    decision.prompt = getContextualPrompt('human-review.md', {
      REVIEW_AUTHOR: context.reviewAuthor,
      REVIEW_BODY: context.reviewBody
    });
    decision.reason = 'Human requested changes';
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
    const summary = `### 🤖 Jules Supervisor (v4.1)
    
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
