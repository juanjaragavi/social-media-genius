/**
 * Test Script: Verify Social Media Genius APIs
 *
 * Tests:
 * 1. Generate post API (Gemini integration)
 * 2. Validate content API
 */

async function testGeneratePost() {
  console.log('\n[Test 1] Generate Post API');
  console.log('-'.repeat(60));

  const testRequest = {
    platform: 'instagram',
    postType: 'promotional',
    topic: 'Launch of new eco-friendly water bottle',
    tone: 'friendly',
    contentLength: 'medium',
    includeHashtags: true,
    includeImage: true,
    imageStyle: 'product-photo',
  };

  console.log('Request:', JSON.stringify(testRequest, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/generate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      return false;
    }

    const data = await response.json();
    console.log('\n✅ Generated Post:');
    console.log('Content:', data.content);
    console.log('Hashtags:', data.hashtags.join(' '));
    console.log('\nImage Prompt:', data.imagePrompt);
    console.log('\nMetadata:');
    console.log(`  - Model: ${data.metadata.model}`);
    console.log(`  - Tokens: ${data.metadata.tokensUsed.total}`);
    console.log(`  - Cost: $${data.metadata.cost.toFixed(6)}`);
    console.log(`  - Time: ${data.metadata.generationTime}ms`);

    return true;
  } catch (error) {
    console.error('❌ Request failed:', error);
    return false;
  }
}

async function testValidateContent() {
  console.log('\n[Test 2] Validate Content API');
  console.log('-'.repeat(60));

  const testRequest = {
    platform: 'twitter',
    content: 'This is a test tweet that is definitely way too long for Twitter because it exceeds the 280 character limit and should be flagged as an error by the validation system. This is additional text to make it even longer and ensure it fails validation properly. Even more text here to be absolutely certain.',
    hashtags: ['#test', '#socialmedia'],
  };

  console.log('Request:', JSON.stringify(testRequest, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/validate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      return false;
    }

    const data = await response.json();
    console.log('\n✅ Validation Result:');
    console.log('Valid:', data.valid ? '✓' : '✗');
    console.log('Errors:', data.errors.length > 0 ? data.errors : 'None');
    console.log('Warnings:', data.warnings.length > 0 ? data.warnings : 'None');
    console.log('Stats:', JSON.stringify(data.stats, null, 2));

    return true;
  } catch (error) {
    console.error('❌ Request failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Social Media Genius - API Tests');
  console.log('='.repeat(60));
  console.log('\nMake sure the dev server is running: npm run dev');
  console.log('Waiting 2 seconds for server to be ready...\n');

  await new Promise(resolve => setTimeout(resolve, 2000));

  const test1Passed = await testGeneratePost();
  const test2Passed = await testValidateContent();

  console.log('\n' + '='.repeat(60));
  if (test1Passed && test2Passed) {
    console.log('✅ All API tests passed!');
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
  console.log('='.repeat(60));
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
