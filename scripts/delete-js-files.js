import fs from 'fs';
import path from 'path';
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

// Add main src directory for App.jsx and main.jsx
directories.push(path.join(__dirname, '../src'));

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
        const newFilePath = filePath.replace(/\.js(x)?$/, newExtension);
        
        // Check if the TypeScript version exists
        if (fs.existsSync(newFilePath)) {
          // Delete the JavaScript file
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${filePath} (TypeScript version exists at ${newFilePath})`);
        } else {
          console.log(`Skipped: ${filePath} (No TypeScript version found)`);
        }
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

console.log('Deletion complete. All JavaScript files with TypeScript equivalents have been removed.');