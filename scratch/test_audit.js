const http = require('http');

const BASE_URL = 'http://localhost:3000';
const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

async function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsedUrl = new URL(url);
    
    const options = {
      method: method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        ...DEFAULT_HEADERS,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          // Response is not JSON
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json || data
        });
      });
    });

    req.on('error', (err) => { reject(err); });

    if (body) {
      req.write(typeof body === 'object' ? JSON.stringify(body) : body);
    }
    req.end();
  });
}

async function runAudit() {
  console.log('============================================================');
  console.log('      LIVE LOCALHOST SERVER SECURITY & FUNCTIONAL AUDIT     ');
  console.log('============================================================\n');
  
  let passes = 0;
  let fails = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] \x1b[32m${message}\x1b[0m`);
      passes++;
    } else {
      console.log(`[FAIL] \x1b[31m${message}\x1b[0m`);
      fails++;
    }
  }

  try {
    // 1. Verify Storefront Landing Page
    console.log('Test 1: Query Storefront Landing Index...');
    const index = await makeRequest('GET', '/');
    assert(index.statusCode === 200, 'Landing page returned HTTP 200 OK');
    assert(index.body.includes('Premium PDF Store'), 'Landing page contains correct storefront headers');

    // 2. Verify Dynamic Book Detail Template
    console.log('\nTest 2: Query Book Detail Page...');
    const bookPage = await makeRequest('GET', '/book/60c72b2f9b1d8a23c4d5e6f1');
    assert(bookPage.statusCode === 200, 'Book details page returned HTTP 200 OK');

    // 3. Verify Server-Side Page Stream preview limits (Authorized bounds)
    console.log('\nTest 3: Fetch Preview Page 1 (Unpaid limits)...');
    const previewOk = await makeRequest('GET', '/api/books/60c72b2f9b1d8a23c4d5e6f1/preview?page=1');
    if (previewOk.statusCode !== 200 || !previewOk.headers['content-type']?.includes('application/pdf')) {
      console.log(`[DEBUG] Test 3 failed: Status=${previewOk.statusCode}, Content-Type=${previewOk.headers['content-type']}, Body=`, previewOk.body);
    }
    assert(previewOk.statusCode === 200, 'Preview page 1 returned HTTP 200 OK');
    assert(previewOk.headers['content-type']?.includes('application/pdf'), 'Preview page returned correct application/pdf content header');

    // 4. Verify Server-Side Page Stream paywall blocks (Unauthorized bounds)
    console.log('\nTest 4: Fetch Locked Page 5 (Paywall enforcement)...');
    const previewLocked = await makeRequest('GET', '/api/books/60c72b2f9b1d8a23c4d5e6f1/preview?page=5');
    assert(previewLocked.statusCode === 403, 'Attempting to fetch page 5 returns HTTP 403 Forbidden');
    assert(previewLocked.body.locked === true, 'Response body correctly returns locked state metadata');

    // 5. Verify Private Downloads security gates
    console.log('\nTest 5: Attempt raw PDF download without login authorization...');
    const downloadLocked = await makeRequest('GET', '/api/download/60c72b2f9b1d8a23c4d5e6f1');
    assert(downloadLocked.statusCode === 401, 'Secure download API blocks unauthenticated downloads with HTTP 401 Unauthorized');

    // 6. Verify Android gateway status heartbeat registration
    console.log('\nTest 6: Send Simulated Android Gateway Heartbeat Ping...');
    const pingRes = await makeRequest('POST', '/api/gateway/ping', {
      deviceId: 'android_test_transceiver',
      appVersion: '1.0.0-audit',
      status: 'online'
    });
    assert(pingRes.statusCode === 200, 'Heartbeat API ping returned HTTP 200 OK');

    // 7. Verify checkout order registration (creating pending transactions)
    console.log('\nTest 7: Submit User Payment Claim (Checkout)...');
    const txId = `AUDIT-${Date.now()}`;
    const checkoutRes = await makeRequest('POST', '/api/payments/checkout', {
      bookId: '60c72b2f9b1d8a23c4d5e6f1',
      amountPaid: 490,
      paymentGateway: 'bkash',
      customerPhone: '01700000000',
      submittedTxID: txId
    }, {
      'x-user-email': 'audit-buyer@example.com'
    });
    assert(checkoutRes.statusCode === 201, 'Checkout API registers order, returning HTTP 201 Created');
    assert(checkoutRes.body.status === 'pending', 'Order registers inside PENDING state awaiting reconciliation');

    // 8. Verify automated SMS gateway webhook sync reconciliations
    console.log('\nTest 8: Simulate Android Webhook SMS Payment received dispatch...');
    const webhookRes = await makeRequest('POST', '/api/payments/webhook', {
      sender: 'bKash',
      message: `You have received Tk 490.00 from 01700000000. Fee Tk 0.00. Balance Tk 10500.00. TrxID ${txId}`
    }, {
      'Authorization': 'Bearer fallback_demo_secret'
    });
    assert(webhookRes.statusCode === 200, 'Webhook receiver endpoint returned HTTP 200 OK');
    assert(webhookRes.body.matched === true, 'Webhook engine reconciles transaction automatically, unlocking order');

    // 9. Verify replay attack database guards
    console.log('\nTest 9: Attempt Replay Attack (Resubmitting duplicate SMS)...');
    const replayRes = await makeRequest('POST', '/api/payments/webhook', {
      sender: 'bKash',
      message: `You have received Tk 490.00 from 01700000000. Fee Tk 0.00. Balance Tk 10500.00. TrxID ${txId}`
    }, {
      'Authorization': 'Bearer fallback_demo_secret'
    });
    assert(replayRes.statusCode === 409, 'Duplicate payment webhook is rejected with HTTP 409 Conflict');

    // 10. Verify Admin dashboard data aggregates
    console.log('\nTest 10: Query Admin Dashboard analytics and metrics...');
    const adminRes = await makeRequest('GET', '/api/admin/dashboard', null, {
      'x-user-email': 'admin-audit@example.com' // Send simulated admin email to bypass auth check
    });
    assert(adminRes.statusCode === 200, 'Admin Dashboard API returns HTTP 200 OK');
    assert(adminRes.body && adminRes.body.gateway !== null && adminRes.body.gateway !== undefined, 'Dashboard returns active Android gateway heartbeat connection metadata');
    assert(adminRes.body && adminRes.body.gateway && adminRes.body.gateway.deviceId === 'android_test_transceiver', 'Active transceiver registers correct ID');

    console.log('\n============================================================');
    console.log(`                  AUDIT COMPLETED: ${passes}/${passes + fails} PASSES                  `);
    console.log('============================================================');
    
  } catch (err) {
    console.error('Audit run encountered an exception:', err);
  }
}

runAudit();
