const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const IGNORE_DIRS = ['ui', 'icons'];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

console.log(`Scanning ${COMPONENTS_DIR} for glassmorphism violations...`);

const files = getAllFiles(COMPONENTS_DIR);
let issues = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(COMPONENTS_DIR, file);

  // Look for className strings
  const classNameRegex = /className=["']([^"']*)["']/g;
  let match = classNameRegex.exec(content);

  while (match !== null) {
    const classes = match[1];

    // Heuristic: Check for container-like styling without glass
    // We look for explicit opaque backgrounds combined with borders/shadows
    const hasBackground = /\bbg-(white|slate-\d+|gray-\d+|zinc-\d+|card|background)\b/.test(classes);
    const hasBorder = /\bborder\b/.test(classes);
    const hasShadow = /\bshadow/.test(classes);
    const hasGlass = /\bglass(-panel|-card)?\b/.test(classes);

    if (hasBackground && (hasBorder || hasShadow) && !hasGlass) {
       // Filter out common false positives and intentional opacities
       if (classes.includes('bg-transparent')) {
         match = classNameRegex.exec(content);
         continue;
       }
       if (classes.includes('popover')) {
         match = classNameRegex.exec(content);
         continue;
       }
       if (classes.includes('dialog')) {
         match = classNameRegex.exec(content);
         continue;
       }
       if (classes.includes('sheet')) {
         match = classNameRegex.exec(content);
         continue;
       }

       issues.push({
         file: relativePath,
         classes: classes
       });
    }
    match = classNameRegex.exec(content);
  }
});

console.log("# Glassmorphism Component Audit\n");
if (issues.length === 0) {
  console.log("No obvious glassmorphism violations found.");
} else {
  console.log(`Found ${issues.length} potential violations (containers without .glass classes):\n`);
  issues.forEach(issue => {
    console.log(`- **${issue.file}**`);
    console.log(`  - Classes: \`${issue.classes}\``);
  });
}
