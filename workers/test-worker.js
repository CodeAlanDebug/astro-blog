#!/usr/bin/env node

/**
 * Test script for the Cloudflare Worker contact form
 * 
 * Usage:
 *   node workers/test-worker.js [worker-url]
 * 
 * If no URL is provided, defaults to http://localhost:8787
 */

const workerUrl = process.argv[2] || 'http://localhost:8787';

console.log('🧪 Testing Cloudflare Worker Contact Form');
console.log('📡 Worker URL:', workerUrl);
console.log('');

// Test data
const validData = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Test Subject',
  message: 'This is a test message for the contact form worker.',
};

const invalidData = {
  name: 'T', // Too short
  email: 'invalid-email',
  subject: 'Test',
  message: 'Short', // Too short
};

const spamData = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Test',
  message: 'This is a test message',
  website: 'https://spam.com', // Honeypot field should be empty
};

async function testEndpoint(testName, data, expectedStatus) {
  console.log(`\n📋 Test: ${testName}`);
  console.log('  Request data:', JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:4321',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    console.log(`  Status: ${response.status}`);
    console.log('  Response:', JSON.stringify(responseData, null, 2));
    
    if (response.status === expectedStatus) {
      console.log('  ✅ PASSED');
      return true;
    } else {
      console.log(`  ❌ FAILED: Expected status ${expectedStatus}, got ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('  ❌ ERROR:', error.message);
    return false;
  }
}

async function testCORS() {
  console.log('\n📋 Test: CORS Preflight Request');
  
  try {
    const response = await fetch(workerUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:4321',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    console.log(`  Status: ${response.status}`);
    console.log('  CORS Headers:');
    console.log(`    Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`    Access-Control-Allow-Methods: ${response.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`    Access-Control-Allow-Headers: ${response.headers.get('Access-Control-Allow-Headers')}`);
    
    if (response.status === 204 && response.headers.get('Access-Control-Allow-Origin')) {
      console.log('  ✅ PASSED');
      return true;
    } else {
      console.log('  ❌ FAILED');
      return false;
    }
  } catch (error) {
    console.log('  ❌ ERROR:', error.message);
    return false;
  }
}

async function testMethodNotAllowed() {
  console.log('\n📋 Test: GET Method Not Allowed');
  
  try {
    const response = await fetch(workerUrl, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:4321',
      },
    });

    const responseData = await response.json();
    
    console.log(`  Status: ${response.status}`);
    console.log('  Response:', JSON.stringify(responseData, null, 2));
    
    if (response.status === 405) {
      console.log('  ✅ PASSED');
      return true;
    } else {
      console.log('  ❌ FAILED: Expected status 405');
      return false;
    }
  } catch (error) {
    console.log('  ❌ ERROR:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('═'.repeat(60));
  console.log('Starting test suite...\n');
  
  const results = [];
  
  // Test CORS preflight
  results.push(await testCORS());
  
  // Test valid submission
  results.push(await testEndpoint('Valid Submission', validData, 200));
  
  // Test invalid data
  results.push(await testEndpoint('Invalid Data (Validation Error)', invalidData, 400));
  
  // Test spam detection
  results.push(await testEndpoint('Spam Detection (Honeypot)', spamData, 400));
  
  // Test method not allowed
  results.push(await testMethodNotAllowed());
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('Test Summary:');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`  Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log(`\n❌ ${total - passed} test(s) failed`);
    process.exit(1);
  }
}

// Check if worker is running
async function checkWorkerAvailability() {
  console.log('🔍 Checking if worker is available...');
  
  try {
    const response = await fetch(workerUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:4321',
      },
    });
    
    if (response.ok || response.status === 204) {
      console.log('✅ Worker is available');
      console.log('');
      return true;
    }
  } catch (error) {
    console.log('❌ Worker is not available');
    console.log('');
    console.log('Please start the worker first:');
    console.log('  wrangler dev workers/contact-form.js');
    console.log('  or');
    console.log('  wrangler dev --config wrangler-worker.toml');
    console.log('');
    return false;
  }
}

// Main execution
(async () => {
  const isAvailable = await checkWorkerAvailability();
  
  if (!isAvailable) {
    process.exit(1);
  }
  
  await runAllTests();
})();
