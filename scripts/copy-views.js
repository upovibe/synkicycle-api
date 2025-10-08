/* eslint-disable */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'views');
const destDir = path.join(__dirname, '..', 'dist', 'views');

// Create dest directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy all files from src/views to dist/views
fs.readdirSync(srcDir).forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied ${file} to dist/views/`);
});

console.log('✅ Views copied successfully!');

