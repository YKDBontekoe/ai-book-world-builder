async function main() {
  const apiKey = process.env.JULES_API_KEY;
  if (!apiKey) {
    console.error("Error: JULES_API_KEY is required");
    process.exit(1);
  }

  const prompt = process.env.PROMPT;
  if (!prompt) {
    console.error("Error: PROMPT is required");
    process.exit(1);
  }

  const branch = process.env.STARTING_BRANCH;
  const repo = process.env.GITHUB_REPOSITORY; // Format: "owner/repo"

  if (!repo) {
    console.error("Error: GITHUB_REPOSITORY is required");
    process.exit(1);
  }

  console.log(`Invoking Jules API for repo ${repo} on branch ${branch}...`);

  // Construct payload according to v1alpha API
  const payload = {
    prompt: prompt,
    sourceContext: {
      source: `sources/github/${repo}`,
      githubRepoContext: {
        startingBranch: branch || "main",
      },
    },
    title: `Supervisor Task: ${branch || "No Branch"}`,
  };

  try {
    const response = await fetch("https://jules.googleapis.com/v1alpha/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Request failed: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data = await response.json();
    console.log("Jules Session Created Successfully!");
    console.log(`Session Resource: ${data.name}`);

    // If the API returns a URL or ID we can link to, we could log it.
    // data.name is likely "sessions/<uuid>"
  } catch (error) {
    console.error("Failed to invoke Jules API:", error);
    process.exit(1);
  }
}

main();
