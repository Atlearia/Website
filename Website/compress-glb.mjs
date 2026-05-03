#!/usr/bin/env node
/**
 * GLB Optimization Pipeline
 * Usage: node compress-glb.mjs [input.glb] [output.glb]
 * 
 * Runs: dedup → weld → simplify → draco
 * Requires: npm i @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions meshoptimizer
 */

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  weld,
  simplify,
  draco,
  textureCompress,
} from '@gltf-transform/functions';
import draco3d from 'draco3d';
import sharp from 'sharp';
import { MeshoptSimplifier } from 'meshoptimizer';
import { readFileSync, statSync } from 'fs';
import { basename } from 'path';

const INPUT = process.argv[2] || 'assets/Room_optimized.glb';
const OUTPUT = process.argv[3] || INPUT.replace('.glb', '_compressed.glb');

function formatSize(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
  return bytes + ' B';
}

async function main() {
  console.log(`\n🔧 GLB Optimization Pipeline`);
  console.log(`   Input:  ${INPUT}`);
  console.log(`   Output: ${OUTPUT}\n`);

  const sizeBefore = statSync(INPUT).size;
  console.log(`📦 Original size: ${formatSize(sizeBefore)}`);

  // Initialize
  await MeshoptSimplifier.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  
  // Register Draco dependencies
  io.registerDependencies({
    'draco3d.encoder': await draco3d.createEncoderModule(),
    'draco3d.decoder': await draco3d.createDecoderModule(),
  });

  console.log(`\n⏳ Loading GLB...`);
  const document = await io.read(INPUT);

  // Step 1: Dedup — remove duplicate accessors, textures, materials
  console.log(`[1/3] 🧹 Deduplicating...`);
  await document.transform(dedup());

  // Step 2: Texture Compression (Visually lossless)
  console.log(`[2/3] 🖼️  Compressing textures to WebP (no resizing)...`);
  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      quality: 85 // high quality, but huge file size savings over PNG
    })
  );

  // Step 3: Draco — compress geometry
  console.log(`[3/3] 🗜️  Applying Draco compression...`);
  await document.transform(draco({ method: 'edgebreaker' }));

  // Write output
  console.log(`\n💾 Writing compressed GLB...`);
  await io.write(OUTPUT, document);

  const sizeAfter = statSync(OUTPUT).size;
  const ratio = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);

  console.log(`\n✅ Done!`);
  console.log(`   ${formatSize(sizeBefore)} → ${formatSize(sizeAfter)} (${ratio}% reduction)`);
  console.log(`   Output: ${OUTPUT}\n`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
