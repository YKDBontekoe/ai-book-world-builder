#!/usr/bin/env tsx
/**
 * Test script for RAG-based entity selection
 * Verifies that the retrieveContext function correctly identifies relevant entities
 */

import { retrieveContext } from "../src/lib/ai/rag";

async function testRAGEntitySelection() {
  console.log("🧪 Testing RAG Entity Selection...\n");

  // Mock 50 entities with various names and summaries
  const mockEntities = [
    {
      name: "Zog the Barbarian",
      kind: "Character",
      summary:
        "A fierce warrior from the northern wastes, known for his battle prowess",
    },
    {
      name: "Elara Moonwhisper",
      kind: "Character",
      summary: "An elven mage specializing in lunar magic and divination",
    },
    {
      name: "The Crimson Blade",
      kind: "Artifact",
      summary: "A legendary sword forged in dragon fire",
    },
    {
      name: "Thornhaven",
      kind: "Location",
      summary: "A fortified city on the edge of the dark forest",
    },
    {
      name: "The Shadow Council",
      kind: "Organization",
      summary: "A secret society manipulating politics from the shadows",
    },
    // Add 45 more generic entities
    ...Array.from({ length: 45 }, (_, i) => ({
      name: `Generic Entity ${i + 1}`,
      kind: "Character",
      summary: "A background character with minimal importance to the story",
    })),
  ];

  // Build candidates
  const candidates = mockEntities.map((entity) => ({
    content: `${entity.name} (${entity.kind}): ${entity.summary}`,
    metadata: { name: entity.name },
  }));

  // Test 1: Query about Zog
  console.log("Test 1: Querying about 'Zog the Barbarian'");
  const query1 = "Tell me about Zog the Barbarian and his adventures";
  const results1 = await retrieveContext({
    query: query1,
    candidates,
    topK: 5,
  });

  console.log(`  Top 5 results for query: "${query1}"`);
  results1.forEach((result, i) => {
    console.log(
      `  ${i + 1}. ${result.metadata.name} (similarity: ${result.similarity.toFixed(4)})`
    );
  });

  const zogInTop5 = results1.some(
    (r) => r.metadata.name === "Zog the Barbarian"
  );
  console.log(`  ✓ Zog in top 5: ${zogInTop5 ? "PASS" : "FAIL"}\n`);

  // Test 2: Query about magic
  console.log("Test 2: Querying about 'magic and spells'");
  const query2 = "What magic users are in this world?";
  const results2 = await retrieveContext({
    query: query2,
    candidates,
    topK: 5,
  });

  console.log(`  Top 5 results for query: "${query2}"`);
  results2.forEach((result, i) => {
    console.log(
      `  ${i + 1}. ${result.metadata.name} (similarity: ${result.similarity.toFixed(4)})`
    );
  });

  const elaraInTop5 = results2.some(
    (r) => r.metadata.name === "Elara Moonwhisper"
  );
  console.log(`  ✓ Elara in top 5: ${elaraInTop5 ? "PASS" : "FAIL"}\n`);

  // Test 3: Query about locations
  console.log("Test 3: Querying about 'cities and locations'");
  const query3 = "Describe the major cities in this world";
  const results3 = await retrieveContext({
    query: query3,
    candidates,
    topK: 5,
  });

  console.log(`  Top 5 results for query: "${query3}"`);
  results3.forEach((result, i) => {
    console.log(
      `  ${i + 1}. ${result.metadata.name} (similarity: ${result.similarity.toFixed(4)})`
    );
  });

  const thornhavenInTop5 = results3.some(
    (r) => r.metadata.name === "Thornhaven"
  );
  console.log(
    `  ✓ Thornhaven in top 5: ${thornhavenInTop5 ? "PASS" : "FAIL"}\n`
  );

  // Summary
  const allPassed = zogInTop5 && elaraInTop5 && thornhavenInTop5;
  console.log(`\n${"=".repeat(50)}`);
  console.log(
    `Overall Result: ${allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}`
  );
  console.log(`${"=".repeat(50)}\n`);

  process.exit(allPassed ? 0 : 1);
}

testRAGEntitySelection().catch((error) => {
  console.error("❌ Test failed with error:", error);
  process.exit(1);
});
