import axios from 'axios';

const API_URL = 'http://localhost:4000/api';
let accessToken = '';

async function runTests() {
    console.log('🔒 STARTING SECURITY TEST SUITE\n');

    // 1. Test User Enumeration Prevention
    console.log('1. Testing User Enumeration Prevention...');
    try {
        // Try to register existing user
        await axios.post(`${API_URL}/auth/register`, {
            name: 'Test',
            email: 'admin@classconnect.com',
            password: 'AdminPass123!'
        });
    } catch (err: any) {
        if (err.response.data.message === 'Registration failed. Please check your information.') {
            console.log('✅ User enumeration blocked (Generic error message returned)');
        } else {
            console.log('❌ User enumeration FAILED. Message:', err.response.data.message);
        }
    }

    // 2. Test Input Sanitization (NoSQL Injection)
    console.log('\n2. Testing NoSQL Injection Protection...');
    try {
        await axios.post(`${API_URL}/auth/login`, {
            email: { "$ne": null }, // Common NoSQL injection
            password: "password"
        });
        console.log('❌ Injection check FAILED (Should have been sanitized/rejected)');
    } catch (err: any) {
        // If it fails with 400/401/422, it's good. 
        // If sanitization works, the email object becomes a string or invalid type, causing login denial
        console.log(`✅ Injection blocked (Response: ${err.response.status})`);
    }

    // 3. Login & Get Token for further tests
    console.log('\nLogging in for authenticated tests...');
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@classconnect.com',
            password: 'AdminPass123!'
        });
        accessToken = res.data.accessToken;
        console.log('✅ Login successful');
    } catch (err) {
        console.error('❌ Login failed, aborting remaining tests');
        return;
    }

    // 4. Test Post Rate Limiting
    console.log('\n4. Testing Post Rate Limiting (Limit: 10/hour)...');
    const headers = { Authorization: `Bearer ${accessToken}` };
    let blocked = false;

    // Create dummy image file approach would be complex here, so we'll just hit the endpoint
    // and expect it to fail validation or rate limit first.
    // Actually, limit is on the route.

    // We'll simulate by sending many requests rapidly
    // Note: Since we don't have a file, it will fail validation, but rate limiter hits first
    try {
        const promises = [];
        for (let i = 0; i < 15; i++) {
            // Just checking if rate limiter triggers before or during validation
            promises.push(axios.post(`${API_URL}/posts`, {}, { headers }).catch(e => e.response));
        }

        const results = await Promise.all(promises);
        const tooManyRequests = results.filter(r => r && r.status === 429);

        if (tooManyRequests.length > 0) {
            console.log(`✅ Rate limiting working. ${tooManyRequests.length} requests blocked with 429.`);
        } else {
            console.log('⚠️ Rate limiting did not trigger (might need more requests or check config)');
            // This might happen if 'postCreationLimiter' count resets or isn't shared correctly in tests
        }
    } catch (err) {
        console.log('Error running rate limit test:', err);
    }

    // 5. Test XSS in Input (Sanitization)
    console.log('\n5. Testing XSS Sanitization...');
    // We can't easily check the output without rendering, but we can check if it accepts it
    // The middleware strip potentially dangerous tags.
    // We'll rely on the manual inspection of the seeded data for this one.
    console.log('ℹ️ Check the "XSS Attempt" post in the UI. Script tags should be removed or encoded.');

    console.log('\n🏁 SECURITY TESTS COMPLETE');
}

runTests();
