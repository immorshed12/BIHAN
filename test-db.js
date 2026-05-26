const mongoose = require('mongoose');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('       MONGODB ATLAS CONNECTION DIAGNOSTICS       ');
console.log('==================================================\n');

// 1. Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('[ERROR] .env.local file not found in the workspace root.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const uri = env.MONGODB_URI;
if (!uri) {
  console.error('[ERROR] MONGODB_URI is not defined in your .env.local file.');
  process.exit(1);
}

console.log(`[INFO] Loaded MONGODB_URI from .env.local: \n  ${uri.replace(/:([^@]+)@/, ':****@')}\n`);

// Helper to test DNS resolution
async function testDNS(hostname) {
  return new Promise((resolve) => {
    dns.resolve(hostname, (err, addresses) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true, addresses });
      }
    });
  });
}

async function runDiagnostics() {
  // Extract hostname from mongodb+srv://...
  const hostMatch = uri.match(/@([^/\\?#]+)/);
  if (hostMatch) {
    const fullHost = hostMatch[1];
    console.log(`[INFO] Testing DNS resolution for database host: ${fullHost}...`);
    
    // Test with default DNS
    const dnsResult = await testDNS(fullHost);
    if (dnsResult.success) {
      console.log(`[PASS] System DNS resolved successfully: ${dnsResult.addresses.join(', ')}`);
    } else {
      console.log(`[WARN] System DNS failed to resolve host: ${dnsResult.error}`);
      
      // Test custom DNS servers
      console.log('[INFO] Testing Cloudflare/Google DNS servers fallback...');
      try {
        dns.setServers(['1.1.1.1', '8.8.8.8']);
        const customDnsResult = await testDNS(fullHost);
        if (customDnsResult.success) {
          console.log(`[PASS] Fallback DNS resolved successfully: ${customDnsResult.addresses.join(', ')}`);
        } else {
          console.error(`[FAIL] Fallback DNS also failed: ${customDnsResult.error}`);
        }
      } catch (dnsErr) {
        console.error(`[FAIL] Failed to configure custom DNS servers: ${dnsErr.message}`);
      }
    }
  }

  console.log('\n[INFO] Connecting to MongoDB via Mongoose...');
  const start = Date.now();
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`\n[SUCCESS] Connected successfully to MongoDB Atlas in ${Date.now() - start}ms!`);
    console.log('Your database connection is fully functional.');
    await mongoose.disconnect();
  } catch (err) {
    console.error(`\n[FAIL] Mongoose connection failed after ${Date.now() - start}ms!`);
    console.error('\n---------------- ERROR DETAILS ----------------');
    console.error(err);
    console.error('-----------------------------------------------');
    
    if (err.message.includes('querySrv ETIMEOUT') || err.message.includes('querySrv ENOTFOUND')) {
      console.log('\n[DIAGNOSIS] This is a DNS SRV record lookup issue. Your local network/ISP is blocking access to MongoDB Atlas SRV DNS lookup.');
      console.log('Action needed: Try changing your DNS in Windows settings to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare), or connect to a VPN/mobile hotspot.');
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.log('\n[DIAGNOSIS] The database username or password in MONGODB_URI in your .env.local file is incorrect.');
      console.log('Action needed: Verify and update the database password in your .env.local file.');
    } else if (err.message.includes('IP is not whitelisted') || err.message.includes('connection refused') || err.reason?.servers) {
      console.log('\n[DIAGNOSIS] Connection was refused. This is likely an IP Whitelist issue or a network firewall blocking port 27017.');
      console.log('Action needed: Log into your MongoDB Atlas console and ensure "Allow Access From Anywhere" (0.0.0.0/0) is added to your IP Access List.');
    }
  }
}

runDiagnostics();
