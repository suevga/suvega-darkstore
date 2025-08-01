import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the root directory of the project
const rootDir = path.resolve(__dirname, '..');

// Define directories to process
const dirsToProcess = [
  'src/components',
  'src/pages',
  'src/hooks',
  'src/store',
  'src/api',
  'src/utility',
  'src',
  'src/config',
  'src/lib',
];

// Function to recursively process directories
const processDirectory = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      fixImportExtensions(fullPath);
    }
  }
};

// Function to fix import extensions in a file
const fixImportExtensions = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let changesCount = 0;

    // Fix .js and .jsx extensions in import statements
    content = content.replace(/import\s+([^;]+?)\s+from\s+['"]([^'"]+?)(\.js|\.jsx|\.ts|\.tsx)['"];?/g, (match, importClause, importPath, extension) => {
      changesCount++;
      console.log(`  - Fixing: import ${importClause} from '${importPath}${extension}' -> import ${importClause} from '${importPath}'`);
      return `import ${importClause} from '${importPath}';`;
    });

    // Fix .js and .jsx extensions in dynamic imports
    content = content.replace(/import\(['"]([^'"]+?)(\.js|\.jsx|\.ts|\.tsx)['"]\)/g, (match, importPath, extension) => {
      changesCount++;
      console.log(`  - Fixing dynamic import: import('${importPath}${extension}') -> import('${importPath}')`);
      return `import('${importPath}')`;
    });

    // Only write to the file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${changesCount} import extensions in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
};

// Process each directory
for (const dir of dirsToProcess) {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  }
}

console.log('Import extension fixing complete!');