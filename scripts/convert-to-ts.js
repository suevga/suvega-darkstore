import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to process
const directories = [
  path.join(__dirname, '../src/components'),
  path.join(__dirname, '../src/pages'),
  path.join(__dirname, '../src/hooks'),
  path.join(__dirname, '../src/store'),
  path.join(__dirname, '../src/api'),
  path.join(__dirname, '../src/utility'),
];

// Function to recursively process directories
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (stat.isFile()) {
      // Check if it's a JavaScript file
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const newExtension = file.endsWith('.js') ? '.ts' : '.tsx';
        const newFilePath = filePath.replace(/\.(js|jsx)$/, newExtension);
        
        // Copy the file with the new extension
        fs.copyFileSync(filePath, newFilePath);
        console.log(`Converted: ${filePath} -> ${newFilePath}`);
      }
    }
  }
}

// Process all directories
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
    console.log(`Processed directory: ${dir}`);
  } else {
    console.log(`Directory does not exist: ${dir}`);
  }
});

console.log('Conversion complete. You can now run ESLint to fix any TypeScript issues.');
console.log('Run: npm run lint');