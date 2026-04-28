// retriever.js
// The "retrieval" half of the RAG pipeline. Takes a query vector (from the
// visitor's hardware) and finds the K nearest neighbors in the knowledge
// base using cosine similarity.
//
// Cosine similarity is the right metric here because we care about the
// direction of the feature vector (what kind of device is it?) more than
// its magnitude. A desktop with 16 cores and a desktop with 8 cores point
// in roughly the same direction; a phone with 8 cores points somewhere
// completely different even though the core count matches.

import { KNOWLEDGE_BASE } from './knowledge-base.js';
import { vectorizeKBEntry } from './vectorizer.js';

// pre-compute knowledge base vectors once at import time.
// this is ~22 entries so it's instant.
const KB_VECTORS = KNOWLEDGE_BASE.map(entry => ({
  entry,
  vector: vectorizeKBEntry(entry),
}));

// cosine similarity between two Float32Arrays
function cosineSim(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// returns the top K matches from the knowledge base, sorted by similarity.
// each result includes the original entry and its similarity score (0-1).
export function retrieve(queryVector, k = 3) {
  const scored = KB_VECTORS.map(({ entry, vector }) => ({
    entry,
    similarity: cosineSim(queryVector, vector),
  }));

  // sort descending by similarity
  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, k);
}

// convenience: check if we got a strong match (similarity > 0.95).
// if the top match is very strong, the RAG result is high confidence
// and we can skip the benchmark.
export function hasStrongMatch(results) {
  return results.length > 0 && results[0].similarity > 0.95;
}
