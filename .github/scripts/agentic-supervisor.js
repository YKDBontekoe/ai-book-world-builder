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
    prBody: '',
    isDraft: false
  };

  if (eventName === 'pull_request' || eventName === 'pull_request_review') {
    context.isPr = true;
    context.number = event.pull_request.number;
    context.branch = event.pull_request.head.ref;
    context.author = event.pull_request.user.login;
    context.labels = event.pull_request.labels.map(l => l.name);
    context.prBody = event.pull_request.body;
    context.isDraft = event.pull_request.draft || false;
    
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
        const prData = JSON.parse(exec(`gh pr view ${context.number} --json body,headRefName,author,labels,isDraft --repo ${repo}`));
        context.branch = prData.headRefName;
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
    const runId = event.workflow_run.id;
    const conclusion = event.workflow_run.conclusion;
    
    try {
      // Use the dedicated endpoint to find PRs for a commit (more reliable than listing all PRs)
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
          try {
            // Fetch detailed failure logs (truncated)
            let logOutput = '';
            try {
                logOutput = exec(`gh run view ${runId} --repo ${repo} --log-failed`);
                if (logOutput.length > 3000) logOutput = logOutput.slice(0, 3000) + '\n... (truncated)';
            } catch (e) {
                logOutput = 'Could not retrieve logs.';
            }

            const jobs = JSON.parse(exec(`gh api "/repos/${repo}/actions/runs/${runId}/jobs" --paginate`));
            const failed = jobs.jobs
              .filter(j => j.conclusion === 'failure')
              .map(j => {
                const failedSteps = j.steps.filter(s => s.conclusion === 'failure').map(s => s.name).join(', ');
                return `- **${j.name}**: ${failedSteps}`;
              }).join('\n');
            
            if (failed) {
              const link = `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${runId}`;
              
              let codecovSection = '';
              try {
                const statuses = JSON.parse(exec(`gh api "/repos/${repo}/commits/${sha}/statuses" --per-page 100`));
                const codecovStatus = statuses.find(s => s.context && s.context.toLowerCase().includes('codecov'));
                
                if (codecovStatus && (codecovStatus.state === 'failure' || codecovStatus.description.toLowerCase().includes('coverage'))) {
                   const icon = codecovStatus.state === 'success' ? '✅' : '❌';
                   codecovSection = `\n\n**Codecov Report**\n${icon} ${codecovStatus.description}\n[View Details](${codecovStatus.target_url})`;
                }
              } catch (e) {
                log(`Warning: Failed to fetch Codecov status: ${e.message}`);
              }
              
              context.failedJobs = `### 🚨 CI Failure\n\n**Failed Jobs:**\n${failed}\n\n**Error Logs:**\n```text\n${logOutput}\n```${codecovSection}\n\n[View Full Log](${link})`;
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

  // ... (Context Injection Logic skipped for brevity) ...

  // ---------------------------------------------------------------------------
  // 4. Decision Logic
  // ---------------------------------------------------------------------------
  
  // ... (Decision setup) ...

  // --- A: Commands & Mentions ---
  // ... (No change) ...

  // --- B: CI Failure ---
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
      // Check if Jules is involved (Author or Commits)
      let isJulesInvolved = authorLower.includes('jules') || authorLower.includes('google-labs');
      
      if (!isJulesInvolved) {
          try {
          const commitAuthors = JSON.parse(exec(`gh pr view ${context.number} --json commits --jq '[.commits[].authors[0].login]'`));
          isJulesInvolved = commitAuthors.some(a => a && (a.toLowerCase().includes('jules') || a.toLowerCase().includes('google-labs')));
          } catch(e) {}
      }

      if (isJulesInvolved) {
          decision.method = 'mention';
          decision.batchedComments = context.failedJobs;
          decision.reason = 'CI Failure (Jules Context)';
      } else {
          // Human PR: Offer help
          try {
              // Only post if we haven't offered recently to avoid spam (simple check)
              const comments = exec(`gh pr view ${context.number} --json comments --jq '.comments[].body'`);
              if (!comments.includes('Reply with: @jules fix')) {
                  exec(`gh pr comment ${context.number} --body "❌ **CI Checks Failed**\n\nI can attempt to fix these issues automatically.\n\nReply with: \`@jules fix\`"`);
              }
          } catch (e) {}
          
          decision.method = 'none';
          decision.reason = 'CI Failure (Human PR - Opt-in required)';
      }
    }
  }

  // --- C: Automated Review ---
  else if (eventName === 'pull_request_review' && 
          (context.reviewAuthor.includes('coderabbitai') || context.reviewAuthor.includes('codecov'))) {
    
    if (context.isDraft) {
      decision.method = 'none';
      decision.reason = 'Draft PR (Review ignored)';
    } else {
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
  }

  // --- D: Label Trigger ---
  // ... (Manual label is usually okay even in draft) ...

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
