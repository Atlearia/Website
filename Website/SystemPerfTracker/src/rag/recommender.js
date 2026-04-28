// recommender.js
// The "generation" half of the RAG pipeline. Takes retrieved matches
// and produces a final quality recommendation.
//
// In a text RAG you'd stuff retrieved docs into an LLM prompt and
// ask it to generate an answer. Here we're doing the equivalent:
// we take the retrieved device profiles, weight their quality settings
// by similarity score, and produce blended settings.
//
// This means an unknown GPU that's 80% similar to an RTX 3070 and
// 60% similar to a GTX 1050 gets settings closer to the RTX, which
// is what you'd want.

// merge retrieved results into a single settings recommendation
export function recommend(retrievedMatches) {
  if (!retrievedMatches || retrievedMatches.length === 0) {
    // no matches at all, return conservative defaults
    return {
      tier: 1,
      confidence: 0,
      settings: defaultSettings(1),
      reasoning: 'no matches found in knowledge base, using safe defaults',
      matches: [],
    };
  }

  const topMatch = retrievedMatches[0];

  // if the top match is really strong (>0.95 similarity), just use it
  // directly. blending would only dilute a confident answer.
  if (topMatch.similarity > 0.95) {
    return {
      tier: topMatch.entry.tier,
      confidence: topMatch.similarity,
      settings: { ...topMatch.entry.settings },
      reasoning: `strong match to "${topMatch.entry.id}" (${(topMatch.similarity * 100).toFixed(1)}% similar)`,
      matches: retrievedMatches.map(formatMatch),
    };
  }

  // otherwise, blend the top matches weighted by similarity
  const totalWeight = retrievedMatches.reduce((s, m) => s + m.similarity, 0);
  if (totalWeight === 0) {
    return {
      tier: 1,
      confidence: 0,
      settings: defaultSettings(1),
      reasoning: 'all match scores were zero, using safe defaults',
      matches: [],
    };
  }

  // weighted average of numeric settings
  const blended = {
    pixelRatio: 0,
    maxTextureSize: 0,
    shadowsEnabled: false,
    fireflyCount: 0,
    antialias: false,
    toneMappingExposure: 0,
  };

  let tierAccum = 0;
  let shadowVotes = 0;
  let aaVotes = 0;

  for (const match of retrievedMatches) {
    const w = match.similarity / totalWeight;
    const s = match.entry.settings;

    blended.pixelRatio += s.pixelRatio * w;
    blended.maxTextureSize += s.maxTextureSize * w;
    blended.fireflyCount += s.fireflyCount * w;
    blended.toneMappingExposure += s.toneMappingExposure * w;

    tierAccum += match.entry.tier * w;

    // booleans: weighted vote
    if (s.shadowsEnabled) shadowVotes += w;
    if (s.antialias) aaVotes += w;
  }

  // round to sensible values
  blended.pixelRatio = Math.round(blended.pixelRatio * 4) / 4; // snap to 0.25 increments
  blended.maxTextureSize = nearestPow2(blended.maxTextureSize);
  blended.fireflyCount = Math.round(blended.fireflyCount / 10) * 10;
  blended.toneMappingExposure = Math.round(blended.toneMappingExposure * 10) / 10;
  blended.shadowsEnabled = shadowVotes > 0.5;
  blended.antialias = aaVotes > 0.5;
  blended.toneMapping = blended.shadowsEnabled ? 'ACESFilmic' : 'Linear';

  const tier = Math.round(tierAccum);

  return {
    tier,
    confidence: topMatch.similarity,
    settings: blended,
    reasoning: `blended from ${retrievedMatches.length} matches, closest: "${topMatch.entry.id}" (${(topMatch.similarity * 100).toFixed(1)}%)`,
    matches: retrievedMatches.map(formatMatch),
  };
}

// override: if the benchmark ran and disagrees with the RAG result,
// adjust the tier. the benchmark is ground truth, the RAG is a guess.
export function adjustWithBenchmark(recommendation, benchFps) {
  if (!benchFps || benchFps <= 0) return recommendation;

  let measuredTier;
  if (benchFps < 15) measuredTier = 0;
  else if (benchFps < 60) measuredTier = 1;
  else if (benchFps < 150) measuredTier = 2;
  else measuredTier = 3;

  // if the benchmark says the device is worse than our guess, believe
  // the benchmark. if it says better, be cautious and average.
  if (measuredTier < recommendation.tier) {
    recommendation.tier = measuredTier;
    recommendation.settings = defaultSettings(measuredTier);
    recommendation.reasoning += ` | benchmark override: ${benchFps}fps → tier ${measuredTier}`;
  } else if (measuredTier > recommendation.tier) {
    // split the difference. maybe the RAG was right and the bench
    // just happened to be fast on a simple scene.
    const avg = Math.round((measuredTier + recommendation.tier) / 2);
    recommendation.tier = avg;
    recommendation.reasoning += ` | benchmark suggests tier ${measuredTier}, averaging to ${avg}`;
  }

  return recommendation;
}

function defaultSettings(tier) {
  switch (tier) {
    case 0: return {
      pixelRatio: 0.5, maxTextureSize: 512, shadowsEnabled: false,
      fireflyCount: 0, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.0,
    };
    case 1: return {
      pixelRatio: 0.75, maxTextureSize: 1024, shadowsEnabled: false,
      fireflyCount: 80, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.4,
    };
    case 2: return {
      pixelRatio: 1.0, maxTextureSize: 2048, shadowsEnabled: false,
      fireflyCount: 200, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    };
    case 3: default: return {
      pixelRatio: 1.5, maxTextureSize: 4096, shadowsEnabled: true,
      fireflyCount: 400, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    };
  }
}

function nearestPow2(n) {
  // snap to nearest power of two (512, 1024, 2048, 4096)
  const powers = [512, 1024, 2048, 4096];
  let closest = powers[0];
  for (const p of powers) {
    if (Math.abs(p - n) < Math.abs(closest - n)) closest = p;
  }
  return closest;
}

function formatMatch(m) {
  return {
    id: m.entry.id,
    gpu: m.entry.gpu,
    tier: m.entry.tier,
    similarity: Math.round(m.similarity * 1000) / 1000,
  };
}
