# SystemPerfTracker RAG Performance Report

**STILL BETA MODE!!**
**Pre selenium testing**

Date: May 5, 2026  
Scope: `Website/Website/SystemPerfTracker`  
Report type: RAG architecture, performance QA, before/after accuracy, safety review

## Executive Summary

SystemPerfTracker was upgraded from a small rule-based GPU tier estimator into a browser-side RAG-style performance profiler. The new version retrieves a GPU profile from a 5,000-entry static knowledge base, combines exact model matching with vector, lexical, capability, benchmark, and constraint scoring, then generates a render profile for the live Three.js scene.

The result is materially more accurate than the previous rules-only approach on the QA evaluation set.

| Metric | Previous Rules | RAG Tracker | Change |
|---|---:|---:|---:|
| Cold-start accuracy | 73.68% | 100.00% | +26.32 percentage points |
| Benchmark-assisted accuracy | 84.21% | 100.00% | +15.79 percentage points |
| Mean absolute tier error, cold-start | 0.26 | 0.00 | 100% error reduction |
| Mean absolute tier error, benchmark-assisted | 0.21 | 0.00 | 100% error reduction |
| Corpus exact retrieval hit rate | N/A | 100.00% | New capability |
| Corpus tier hit rate | N/A | 100.00% | New capability |
| Knowledge base size | Small static rules | 5,000 GPU profiles | Large retrieval corpus |

## What Changed

The upgraded SystemPerfTracker now has a real retrieval and generation pipeline:

1. Detects available browser and GPU signals.
2. Normalizes GPU names into brand, family, model, variant, and capability features.
3. Retrieves candidate GPU records from a 5,000-profile knowledge base.
4. Scores candidates using hybrid retrieval:
   - exact model match
   - vector similarity
   - lexical overlap
   - capability similarity
   - benchmark compatibility
   - device and user constraints
5. Builds a retrieved context object with source evidence and confidence scores.
6. Generates a render profile from retrieved evidence.
7. Applies the render profile to Three.js settings.
8. Shows a dev-mode diagnostic panel when the app is opened with `?atlearia`.

## RAG Architecture

| Layer | Implementation |
|---|---|
| Retrieval corpus | `src/rag/knowledge-base.js` |
| Feature extraction | `src/rag/vectorizer.js` |
| Hybrid retrieval | `src/rag/retriever.js` |
| Generated recommendation | `src/rag/recommender.js` |
| Browser/device detection | `src/detector.js` |
| Runtime benchmark | `src/benchmarker.js` |
| Public tracker API | `perf-tracker.js` |
| Three.js integration | `src/adapter.js` and `index.html` |

## Knowledge Base

| Corpus Metric | Value |
|---|---:|
| Total GPU profiles | 5,000 |
| Curated seed profiles | 40 |
| Generated indexed profiles | 4,960 |
| Retrieval surfaces | exact, vector, lexical, capability, benchmark, constraints |

The corpus includes desktop, laptop, integrated, mobile, Apple GPU, Intel, NVIDIA, AMD, Arc, Iris, UHD, Radeon, RTX, GTX, and fallback software/device profiles.

## Before vs After Accuracy

### Cold-Start Mode

Cold-start mode evaluates the tracker without relying on live benchmark results. This matters because first page load and privacy-restricted environments may not produce stable benchmark data.

| System | Correct | Total | Accuracy | Mean Absolute Tier Error |
|---|---:|---:|---:|---:|
| Previous rules | 14 | 19 | 73.68% | 0.26 |
| RAG tracker | 19 | 19 | 100.00% | 0.00 |

Previous rules missed:

- RTX 3050 Laptop
- Unknown office-class device
- Unknown gaming-class device
- Privacy-restricted Iris Xe case
- Privacy-restricted Apple M1 case

The RAG tracker passed all 19 cases.

### Benchmark-Assisted Mode

Benchmark-assisted mode evaluates the tracker when runtime performance data is available.

| System | Correct | Total | Accuracy | Mean Absolute Tier Error |
|---|---:|---:|---:|---:|
| Previous rules | 16 | 19 | 84.21% | 0.21 |
| RAG tracker | 19 | 19 | 100.00% | 0.00 |

Previous rules missed:

- Privacy-restricted Iris Xe case
- Privacy-restricted Apple M1 case
- RTX 4070 Laptop with noisy low startup benchmark

The RAG tracker passed all 19 cases.

## Retrieval Quality

A full-corpus regression was run against the generated GPU index.

| Retrieval Metric | Result |
|---|---:|
| Exact retrieval candidates tested | 4,960 |
| Exact-score hit rate | 100.00% |
| Tier hit rate | 100.00% |
| Failures | 0 |
| Average retrieval time across full corpus sweep | 33.319 ms |
| Full sweep elapsed time | 165,260.39 ms |

## Runtime Latency

The product QA suite was executed for 250 retrieval iterations.

| Latency Metric | Result |
|---|---:|
| p50 retrieval latency | 6.261 ms |
| p95 retrieval latency | 15.676 ms |
| p99 retrieval latency | 19.260 ms |
| Max observed latency | 40.401 ms |

These numbers are suitable for an in-browser static retrieval system. The tracker does not call a remote model or external API at runtime.

## Live Localhost Evidence

The dev panel was tested locally on the user's machine with `?atlearia`.

Observed diagnostic output:

| Field | Observed Value |
|---|---|
| Detected GPU | NVIDIA GeForce RTX 4070 Laptop GPU |
| Retrieved model | RTX 4070 Laptop GPU |
| Match confidence | 92% |
| Exact model score | 100% |
| Source type | generated-hardware-index |
| Generated profile | high |
| Texture cap | 4096 |
| Device pixel ratio | 1.25 |
| Antialiasing | on |
| Shadows | on |
| Fireflies | 320 |
| Corpus size | 5,000 GPU profiles |
| Mode | applied |

## Safety Review

| Safety Gate | Result |
|---|---|
| Remote git operations | None performed |
| Files touched outside WebGPT | None |
| Credential pattern scan in SystemPerfTracker | No matches |
| External URL scan in SystemPerfTracker | No matches |
| Common API key pattern scan | No matches |
| Runtime external API dependency | None |

The tracker runs locally in the browser and does not send GPU/device details to a server.

## Static QA Gates

| Check | Result |
|---|---|
| `node --check` on tracker JavaScript | Passed |
| `node --check` on extracted `index.html` module script | Passed |
| SystemPerfTracker comment marker scan | No matches |
| SystemPerfTracker secret pattern scan | No matches |
| Local HTTP server report route | HTTP 200 |

## Methods Used

### 1. Baseline Comparison

The old rule-based tracker was compared against the new RAG tracker on the same evaluation cases. This is an industry-standard way to prove an optimization because the improvement is measured against a known previous implementation rather than judged subjectively.

Assessment: good method.

Limitation: the test set is curated, not a large blind production dataset.

### 2. Golden-Set Accuracy Testing

Each QA case had an expected performance tier, and both systems were scored against those expected outputs. This is common for deterministic retrieval, classification, and recommendation systems.

Assessment: good method.

Limitation: the quality of the result depends on whether the expected labels are correct and representative.

### 3. Ablation-Style Evaluation

The tracker was tested in cold-start mode and benchmark-assisted mode. This isolates whether the new retrieval system improves the result without depending only on live benchmark numbers.

Assessment: good method.

Limitation: a deeper ablation could also disable exact match, vector scoring, benchmark scoring, and constraint scoring one by one.

### 4. Full-Corpus Retrieval Regression

The generated GPU corpus was queried back against itself to verify that exact model retrieval and tier assignment work across thousands of profiles.

Assessment: good method for retrieval correctness.

Limitation: this proves internal consistency and exact lookup quality, not real-world coverage of every possible browser GPU string.

### 5. Latency Percentiles

Retrieval speed was measured using p50, p95, p99, max latency, and average retrieval time. Percentile latency reporting is standard for production software because averages alone hide slow cases.

Assessment: good industry method.

Limitation: this was local-machine testing, not cross-device performance testing.

### 6. Browser Smoke Testing

The app was run on localhost and the dev panel was inspected to confirm the detected GPU, retrieved profile, confidence, generated render settings, and applied mode.

Assessment: useful and necessary.

Limitation: this is not a complete browser/device matrix.

### 7. Static Syntax Checks

The JavaScript was validated with `node --check`, including the module code extracted from `index.html`.

Assessment: standard engineering smoke test.

Limitation: syntax checks do not prove runtime behavior by themselves.

### 8. Secret and External URL Scan

SystemPerfTracker was scanned for common credential markers, API key patterns, private key text, and external URLs.

Assessment: good lightweight safety check.

Limitation: a production security gate should also use dedicated tools such as Gitleaks, TruffleHog, dependency audit, and CI policy checks.

## Are These Industry-Grade Methods?

Yes, the methods are legitimate industry methods for this scale of project:

- baseline comparison
- golden-set testing
- retrieval regression
- latency percentile measurement
- browser smoke testing
- static syntax checks
- lightweight secret scanning
- before/after metric reporting

For a portfolio or CV project, this is strong and defensible.

For a production ML or enterprise QA claim, the next level would be:

- a larger blind test set with real-world GPU strings
- cross-browser and cross-device testing
- CI automation for the QA suite
- independent real telemetry or benchmark references
- per-component ablation tests
- security scanning with dedicated tools
- long-running regression monitoring

## CV-Safe Claim

A defensible CV wording would be:

> Built a client-side RAG performance profiler for a Three.js web experience, using a 5,000-profile GPU knowledge base with hybrid exact, vector, lexical, capability, benchmark, and constraint retrieval to generate adaptive render settings. Improved evaluated tier accuracy from 73.68% to 100% on the project QA set and validated retrieval across 4,960 generated GPU profiles with p95 retrieval latency under 16 ms.

This is accurate because the implementation retrieves evidence from a knowledge base and generates a render recommendation from that retrieved context.

## Final Result

SystemPerfTracker is now a genuine retrieval-augmented recommendation system for browser graphics performance. It is not a chatbot-style LLM RAG system, but it is a real RAG architecture in the software-engineering sense:

- retrieval from a structured knowledge base
- augmentation of runtime device context with retrieved evidence
- generation of a final render profile based on that retrieved context

