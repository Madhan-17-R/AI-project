import fs from 'fs';
import path from 'path';
import { TRANSLATIONS, Language } from '../src/lib/i18n/translations';
import { en } from '../src/lib/i18n/locales/en';

console.log('\nMARUDAM i18n Validator — Strict Execution');
console.log('='.repeat(50));

const EXPECTED_LOCALES = 22;
const locales = Object.keys(TRANSLATIONS) as Language[];

if (locales.length !== EXPECTED_LOCALES) {
  console.error(`❌ FATAL: Expected ${EXPECTED_LOCALES} locales, found ${locales.length}.`);
  process.exit(1);
}

// 1. Flatten schema helper
function flattenKeys(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenKeys(obj[key], prefix + key + '.'));
    } else {
      result[prefix + key] = String(obj[key]);
    }
  }
  return result;
}

const enFlat = flattenKeys(en);
const enKeys = Object.keys(enFlat);

const ENGLISH_FALLBACK_MARKERS = [
  'Sign In', 'Sign Out', 'Sign in', 'Sign up',
  'Dashboard', 'Farm Information', 'Farmer Name',
  'Waiting for ESP32', 'Getting Started',
  'Field Event Notifications', 'Recommendation Notifications',
  'Device Alerts', 'Learning Status', 'Baseline Confidence',
  'Review Schedule', 'Marudam continuously learns your field',
  'How Marudam works', 'How to read field health',
  'Soil moisture', 'Soil temperature', 'Light intensity',
  'Air humidity', 'Surrounding temperature',
  'Field Health', 'Recommendations', 'Adaptive Baseline',
  'How to connect the device', 'Supported languages',
  'Your field looks normal', 'Your field is drier',
  'Soil moisture has remained below',
  'Root zone moisture is estimated',
  'Rain is likely in the near future',
  'No sensor data received yet',
  'Field Learning Schedule',
  'Sensor not connected',
  'Welcome to Marudam',
  'Not available',
  'Loading', 'Error', 'Cancel', 'Confirm',
];

const DEBUG_MARKERS = /\[(TA|HI|BN|TE|MR|GU|KN|ML|PA|AS|MA|SA|KO|MN|KS|NE|SD|DO|ST|XX|EN)\]/;
const COMING_SOON = /coming soon/i;

// 2. Extract interpolations (e.g. {crop})
function getInterpolations(str: string): string[] {
  const matches = str.match(/\{[^}]+\}/g);
  return matches ? matches.sort() : [];
}

let hasErrors = false;

for (const lang of locales) {
  console.log(`\nChecking locale: ${lang}`);
  const localeObj = TRANSLATIONS[lang];
  const localeFlat = flattenKeys(localeObj);
  const localeKeys = Object.keys(localeFlat);
  
  const missingKeys: string[] = [];
  const unexpectedKeys: string[] = [];
  const interpolationErrors: string[] = [];
  const englishFallbacks: string[] = [];
  const debugMarkers: string[] = [];
  const comingSoons: string[] = [];
  
  // Missing keys
  for (const k of enKeys) {
    if (!(k in localeFlat)) {
      missingKeys.push(k);
    }
  }
  
  // Unexpected keys
  for (const k of localeKeys) {
    if (!(k in enFlat)) {
      unexpectedKeys.push(k);
    }
  }
  
  // Value checks
  for (const [k, v] of Object.entries(localeFlat)) {
    if (!(k in enFlat)) continue;
    
    // Interpolation mismatch
    const enVars = getInterpolations(enFlat[k]).join(',');
    const locVars = getInterpolations(v).join(',');
    if (enVars !== locVars) {
      interpolationErrors.push(`${k} (Expected: ${enVars || 'none'}, Found: ${locVars || 'none'})`);
    }
    
    // Debug & Coming Soon
    if (DEBUG_MARKERS.test(v)) debugMarkers.push(k);
    if (COMING_SOON.test(v)) comingSoons.push(k);
    
    // English Fallback (Only check non-English)
    if (lang !== 'English') {
      for (const marker of ENGLISH_FALLBACK_MARKERS) {
        // Exact match or contains for longer sentences
        if (v === marker || (v.includes(marker) && marker.length > 10)) {
          englishFallbacks.push(`${k}: "${marker}"`);
          break;
        }
      }
    }
  }
  
  const errors = [
    { name: 'Missing keys', data: missingKeys },
    { name: 'Unexpected keys', data: unexpectedKeys },
    { name: 'Interpolation errors', data: interpolationErrors },
    { name: 'English fallbacks', data: englishFallbacks },
    { name: 'Debug markers', data: debugMarkers },
    { name: 'Coming soon tags', data: comingSoons },
  ];
  
  let localePass = true;
  for (const err of errors) {
    if (err.data.length > 0) {
      hasErrors = true;
      localePass = false;
      console.log(`  ❌ ${err.name} (${err.data.length}):`);
      // print first 5
      err.data.slice(0, 5).forEach(d => console.log(`     - ${d}`));
      if (err.data.length > 5) console.log(`     ... and ${err.data.length - 5} more`);
    }
  }
  
  if (localePass) {
    console.log(`  ✅ PASS`);
  }
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ Validation FAILED. Please fix localization issues.');
  process.exit(1);
} else {
  console.log('✅ Validation PASSED.');
  process.exit(0);
}
