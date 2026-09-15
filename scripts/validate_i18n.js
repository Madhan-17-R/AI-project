#!/usr/bin/env node
// MARUDAM i18n Validator
// Validates all 22 locale TypeScript files against the English canonical schema.
// No external dependencies beyond TypeScript runtime.

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'locales');

const LOCALE_FILES = {
  'English': 'en.ts',
  'Hindi': 'hindi.ts',
  'Bengali': 'bengali.ts',
  'Telugu': 'telugu.ts',
  'Marathi': 'marathi.ts',
  'Tamil': 'tamil.ts',
  'Gujarati': 'gujarati.ts',
  'Urdu': 'urdu.ts',
  'Kannada': 'kannada.ts',
  'Odia': 'odia.ts',
  'Malayalam': 'malayalam.ts',
  'Punjabi': 'punjabi.ts',
  'Assamese': 'assamese.ts',
  'Maithili': 'maithili.ts',
  'Sanskrit': 'sanskrit.ts',
  'Konkani': 'konkani.ts',
  'Manipuri': 'manipuri.ts',
  'Kashmiri': 'kashmiri.ts',
  'Nepali': 'nepali.ts',
  'Sindhi': 'sindhi.ts',
  'Dogri': 'dogri.ts',
  'Santali': 'santali.ts',
};

const DEBUG_MARKER_PATTERN = /\[(TA|HI|BN|TE|MR|GU|KN|ML|PA|AS|MA|SA|KO|MN|KS|NE|SD|DO|ST|XX|EN)\]/;
const COMING_SOON_PATTERN = /coming soon/i;

function extractKeyValues(content) {
  const sections = {};
  // Match sections: key: { ... }
  const sectionRegex = /["']?(\w+)["']?\s*:\s*\{([\s\S]*?)(?=\n  ["']?\w+["']?\s*:|^};)/gm;
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionName = match[1];
    const sectionBody = match[2];
    if (['import', 'export', 'const', 'return'].includes(sectionName)) continue;
    sections[sectionName] = {};
    // Match key: 'value' pairs
    const kvRegex = /["']?(\w+)["']?\s*:\s*['"]([^'"]*(?:\\.[^'"]*)*)['"],?/g;
    let kv;
    while ((kv = kvRegex.exec(sectionBody)) !== null) {
      sections[sectionName][kv[1]] = kv[2];
    }
  }
  return sections;
}

function flatten(obj, prefix = '') {
  const result = {};
  for (const [section, keys] of Object.entries(obj)) {
    for (const [key, val] of Object.entries(keys)) {
      result[prefix + section + '.' + key] = val;
    }
  }
  return result;
}

console.log('\nMARUDAM i18n Validation Report');
console.log('='.repeat(50));

// Load English
const enPath = path.join(LOCALES_DIR, 'en.ts');
const enContent = fs.readFileSync(enPath, 'utf-8');
const enSections = extractKeyValues(enContent);
const enFlat = flatten(enSections);
const enKeys = Object.keys(enFlat);

console.log('English schema sections:', Object.keys(enSections).join(', '));
console.log('English schema keys:', enKeys.length);
console.log('');

let totalMissing = 0;
let totalDebugMarkers = 0;
let totalComingSoon = 0;
let overallPass = true;

const results = {};

for (const [lang, filename] of Object.entries(LOCALE_FILES)) {
  const filepath = path.join(LOCALES_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(lang.padEnd(15) + ' FAIL (file not found)');
    overallPass = false;
    results[lang] = { pass: false, missing: enKeys.length, debug: 0, comingSoon: 0 };
    continue;
  }
  
  const content = fs.readFileSync(filepath, 'utf-8');
  const sections = extractKeyValues(content);
  const flat = flatten(sections);
  
  const missing = [];
  const debugMarkers = [];
  const comingSoon = [];
  
  for (const key of enKeys) {
    if (!(key in flat)) {
      missing.push(key);
    }
  }
  
  // Check for debug markers and coming soon in values
  for (const [key, val] of Object.entries(flat)) {
    if (DEBUG_MARKER_PATTERN.test(val)) {
      debugMarkers.push(key + ': ' + val.substring(0, 40));
    }
    if (COMING_SOON_PATTERN.test(val)) {
      comingSoon.push(key + ': ' + val.substring(0, 40));
    }
  }
  
  totalMissing += missing.length;
  totalDebugMarkers += debugMarkers.length;
  totalComingSoon += comingSoon.length;
  
  const pass = missing.length === 0 && debugMarkers.length === 0 && comingSoon.length === 0;
  if (!pass) overallPass = false;
  
  const status = pass ? 'PASS' : 'FAIL';
  const details = [];
  if (missing.length > 0) details.push(missing.length + ' missing keys');
  if (debugMarkers.length > 0) details.push(debugMarkers.length + ' debug markers');
  if (comingSoon.length > 0) details.push(comingSoon.length + ' Coming Soon strings');
  
  const detailStr = details.length > 0 ? ' (' + details.join(', ') + ')' : '';
  console.log((lang + ':').padEnd(15) + ' ' + status + detailStr);
  
  results[lang] = { pass, missing, debugMarkers, comingSoon };
}

console.log('');
console.log('='.repeat(50));
console.log('Total missing keys across all locales: ' + totalMissing);
console.log('Total debug markers: ' + totalDebugMarkers);
console.log('Total Coming Soon strings: ' + totalComingSoon);
console.log('');
console.log('OVERALL: ' + (overallPass ? 'PASS' : 'FAIL'));

// Print missing keys detail for failed locales (first 5 per locale)
let hasDetails = false;
for (const [lang, r] of Object.entries(results)) {
  if (r.missing && r.missing.length > 0) {
    if (!hasDetails) { console.log('\nMissing keys detail:'); hasDetails = true; }
    console.log('  ' + lang + ': ' + r.missing.slice(0, 5).join(', ') + (r.missing.length > 5 ? ' ... (' + r.missing.length + ' total)' : ''));
  }
}

process.exit(overallPass ? 0 : 1);
