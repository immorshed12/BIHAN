const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\conne\\.gemini\\antigravity-ide\\brain\\0b842948-45fa-4eed-a905-8b1f187000f5\\media__1779774157306.png';
const destLogo = path.join(__dirname, '..', 'public', 'logo.png');
const destFaviconPublic = path.join(__dirname, '..', 'public', 'favicon.ico');
const destFaviconApp = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');

try {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, destLogo);
    console.log('Successfully copied logo to public/logo.png');
    fs.copyFileSync(src, destFaviconPublic);
    console.log('Successfully copied favicon to public/favicon.ico');
    fs.copyFileSync(src, destFaviconApp);
    console.log('Successfully copied favicon to src/app/favicon.ico');
  } else {
    console.error('Source file not found at:', src);
  }
} catch (err) {
  console.error('Error copying files:', err.message);
}
