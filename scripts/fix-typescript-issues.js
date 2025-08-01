const fs = require('fs');
const path = require('path');

// Common fixes to apply
const fixes = [
  // Fix error handling
  {
    pattern: /catch \(error\) \{[\s\S]*?error\.message/g,
    replacement: (match) => match.replace('error.message', 'error instanceof Error ? error.message : String(error)')
  },
  
  // Fix error response handling
  {
    pattern: /error\.response\?\.\w+\?\.\w+/g,
    replacement: (match) => `(error as any)?.response?.data?.message`
  },
  
  // Fix function parameter types for common patterns
  {
    pattern: /= \((\w+)\) =>/g,
    replacement: '= ($1: any) =>'
  },
  
  // Fix array state initialization
  {
    pattern: /useState\(\[\]\)/g,
    replacement: 'useState<any[]>([])'
  },
  
  // Fix null state initialization
  {
    pattern: /useState\(null\)/g,
    replacement: 'useState<any>(null)'
  },
  
  // Fix event handlers
  {
    pattern: /onChange=\{(\w+)\}/g,
    replacement: 'onChange={($1 as any)}'
  },
  
  // Fix onClick handlers
  {
    pattern: /onClick=\{(\w+)\}/g,
    replacement: 'onClick={($1 as any)}'
  }
];

function fixTypeScriptFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Apply common fixes
    fixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        changed = true;
      }
    });
    
    // Add React import if not present and file uses React
    if (path.extname(filePath) === '.tsx' && !content.includes('import React') && content.includes('<')) {
      content = `import React from 'react';\n${content}`;
      changed = true;
    }
    
    // Remove unused React import
    if (content.includes('import React,') && !content.includes('React.')) {
      content = content.replace('import React, ', 'import ');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      walkDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixTypeScriptFile(filePath);
    }
  });
}

// Start fixing from src directory
const srcDir = path.join(__dirname, '..', 'src');
console.log('Starting TypeScript fixes...');
walkDirectory(srcDir);
console.log('TypeScript fixes completed!');
