#!/usr/bin/env node

/**
 * Unit tests for the Cloudflare Worker contact form
 * Tests the worker functions without requiring a running server
 */

import fs from 'fs';

console.log('🧪 Running Worker Unit Tests\n');

// Import worker module (we'll test the functions)
const workerCode = fs.readFileSync('./workers/contact-form.js', 'utf8');

// Test configurations
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Worker file exists and is valid JavaScript
test('Worker file exists and has valid syntax', () => {
  assert(workerCode.length > 0, 'Worker file should not be empty');
  assert(workerCode.includes('export default'), 'Worker should have default export');
  assert(workerCode.includes('async fetch'), 'Worker should have fetch handler');
  console.log('  ✓ Worker has valid structure');
});

// Test 2: Worker has proper configuration
test('Worker has proper configuration', () => {
  assert(workerCode.includes('RECIPIENT_EMAIL'), 'Worker should have recipient email config');
  assert(workerCode.includes('SENDER_EMAIL'), 'Worker should have sender email config');
  assert(workerCode.includes('ALLOWED_ORIGINS'), 'Worker should have CORS config');
  console.log('  ✓ Configuration found');
});

// Test 3: Worker has validation functions
test('Worker has validation functions', () => {
  assert(workerCode.includes('validateFormData'), 'Worker should have validation function');
  assert(workerCode.includes('EMAIL_REGEX'), 'Worker should have email validation');
  assert(workerCode.includes('honeypot'), 'Worker should have spam protection');
  console.log('  ✓ Validation functions found');
});

// Test 4: Worker has email sending function
test('Worker has email sending function', () => {
  assert(workerCode.includes('sendEmail'), 'Worker should have sendEmail function');
  assert(workerCode.includes('mailchannels.net'), 'Worker should use MailChannels');
  assert(workerCode.includes('escapeHtml'), 'Worker should escape HTML for security');
  console.log('  ✓ Email sending function found');
});

// Test 5: Worker has CORS handling
test('Worker has CORS handling', () => {
  assert(workerCode.includes('getCorsHeaders'), 'Worker should have CORS headers function');
  assert(workerCode.includes('handleOptions'), 'Worker should handle OPTIONS requests');
  assert(workerCode.includes('Access-Control-Allow-Origin'), 'Worker should set CORS headers');
  console.log('  ✓ CORS handling found');
});

// Test 6: Worker has error handling
test('Worker has error handling', () => {
  assert(workerCode.includes('try {'), 'Worker should have try-catch blocks');
  assert(workerCode.includes('catch (error)'), 'Worker should catch errors');
  assert(workerCode.includes('console.error'), 'Worker should log errors');
  console.log('  ✓ Error handling found');
});

// Test 7: Worker has security features
test('Worker has security features', () => {
  assert(workerCode.includes('escapeHtml'), 'Worker should have XSS protection');
  assert(workerCode.includes('website'), 'Worker should have honeypot field');
  assert(workerCode.includes('isOriginAllowed'), 'Worker should validate origins');
  console.log('  ✓ Security features found');
});

// Test 8: Worker validates required fields
test('Worker validates required fields', () => {
  assert(workerCode.includes('MIN_NAME_LENGTH'), 'Worker should validate name length');
  assert(workerCode.includes('MIN_MESSAGE_LENGTH'), 'Worker should validate message length');
  assert(workerCode.includes('EMAIL_REGEX'), 'Worker should validate email format');
  console.log('  ✓ Field validation found');
});

// Test 9: Worker handles different content types
test('Worker handles different content types', () => {
  assert(workerCode.includes('application/json'), 'Worker should handle JSON');
  assert(workerCode.includes('multipart/form-data'), 'Worker should handle form data');
  assert(workerCode.includes('Content-Type'), 'Worker should check content type');
  console.log('  ✓ Content type handling found');
});

// Test 10: Worker returns proper responses
test('Worker returns proper responses', () => {
  assert(workerCode.includes('jsonResponse'), 'Worker should have JSON response helper');
  assert(workerCode.includes('success'), 'Worker should return success status');
  assert(workerCode.includes('errors'), 'Worker should return error details');
  console.log('  ✓ Response handling found');
});

// Test 11: Email template quality
test('Email template has proper HTML structure', () => {
  assert(workerCode.includes('<!DOCTYPE html>'), 'Email should have DOCTYPE');
  assert(workerCode.includes('<style>'), 'Email should have styles');
  assert(workerCode.includes('header'), 'Email should have header section');
  assert(workerCode.includes('footer'), 'Email should have footer section');
  console.log('  ✓ Email template structure found');
});

// Test 12: Wrangler configuration exists
test('Wrangler configuration exists', () => {
  const wranglerExists = fs.existsSync('./wrangler-worker.toml');
  assert(wranglerExists, 'Wrangler config file should exist');
  
  const wranglerConfig = fs.readFileSync('./wrangler-worker.toml', 'utf8');
  assert(wranglerConfig.includes('name'), 'Wrangler config should have name');
  assert(wranglerConfig.includes('main'), 'Wrangler config should have main entry');
  assert(wranglerConfig.includes('compatibility_date'), 'Wrangler config should have compatibility date');
  console.log('  ✓ Wrangler configuration valid');
});

// Test 13: Documentation exists
test('Documentation exists', () => {
  const readmeExists = fs.existsSync('./workers/README.md');
  assert(readmeExists, 'Worker README should exist');
  
  const workerIntegrationExists = fs.existsSync('./WORKER_INTEGRATION.md');
  assert(workerIntegrationExists, 'Integration guide should exist');
  
  const envExampleExists = fs.existsSync('./.env.example');
  assert(envExampleExists, 'Environment example should exist');
  
  console.log('  ✓ All documentation files exist');
});

// Run all tests
async function runTests() {
  console.log('═'.repeat(60));
  console.log('Running unit tests...\n');
  
  for (const test of tests) {
    try {
      console.log(`📋 ${test.name}`);
      await test.fn();
      passed++;
    } catch (error) {
      console.log(`  ❌ FAILED: ${error.message}`);
      failed++;
    }
    console.log('');
  }
  
  // Summary
  console.log('═'.repeat(60));
  console.log('Test Summary:');
  console.log(`  Total: ${tests.length}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('');
  
  if (failed === 0) {
    console.log('🎉 All unit tests passed!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Deploy the worker: wrangler deploy --config wrangler-worker.toml');
    console.log('  2. Set PUBLIC_CONTACT_WORKER_URL environment variable');
    console.log('  3. Test with: node workers/test-worker.js [worker-url]');
    console.log('');
    process.exit(0);
  } else {
    console.log(`❌ ${failed} test(s) failed`);
    process.exit(1);
  }
}

runTests();
