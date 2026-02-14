#!/usr/bin/env node
/**
 * This script patches the @automerge/automerge package to work with webpack.
 * The web version of automerge-wasm is missing the automerge_wasm_bg.js file
 * that webpack needs. This script copies it from the bundler version.
 */

const fs = require('fs');
const path = require('path');

const automergeWebDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@automerge',
  'automerge',
  'dist',
  'mjs',
  'wasm_bindgen_output',
  'web'
);

const automergeBindlerDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@automerge',
  'automerge',
  'dist',
  'mjs',
  'wasm_bindgen_output',
  'bundler'
);

const sourceFile = path.join(automergeBindlerDir, 'automerge_wasm_bg.js');
const targetFile = path.join(automergeWebDir, 'automerge_wasm_bg.js');

try {
  if (fs.existsSync(sourceFile) && !fs.existsSync(targetFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✅ Patched automerge: copied automerge_wasm_bg.js to web directory');
  } else if (fs.existsSync(targetFile)) {
    console.log('ℹ️ Automerge already patched');
  } else {
    console.warn('⚠️ Could not find automerge bundler file to copy');
  }
} catch (error) {
  console.error('❌ Error patching automerge:', error.message);
  process.exit(1);
}

