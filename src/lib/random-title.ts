export function generateRandomTitle(): string {
  const adjectives = [
    "Hidden", "Lost", "Silent", "Crimson", "Eternal", "Broken", "Shattered",
    "Golden", "Dark", "Infinite", "Secret", "Forbidden", "Ancient", "Forgotten",
    "Crystal", "Obsidian", "Fading", "Rising", "Invisible", "Hollow", "Burning",
    "Frozen", "Whispering", "Thundering", "Velvet", "Iron", "Steel", "Silver"
  ];

  const nouns = [
    "Empire", "Legacy", "World", "Kingdom", "Promise", "Memory", "Shadow",
    "Light", "Prophecy", "Throne", "Voyage", "Secret", "Destiny", "Dream",
    "Echo", "Horizon", "Oath", "Requiem", "Symphony", "Paradox", "Citadel",
    "Sanctuary", "Wilderness", "Abyss", "Constellation", "Chronicle", "Legend"
  ];

  const patterns = [
    () => `The ${sample(adjectives)} ${sample(nouns)}`,
    () => `${sample(adjectives)} ${sample(nouns)}`,
    () => `The ${sample(nouns)} of ${sample(nouns)}`,
    () => `The ${sample(nouns)} of the ${sample(adjectives)} ${sample(nouns)}`
  ];

  const pattern = sample(patterns);
  return pattern();
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
