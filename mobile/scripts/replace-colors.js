const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /#0f172a/g, to: '#000000' }, // bg-primary
  { from: /rgba\(15, 23, 42/g, to: 'rgba(17, 17, 17' }, // dark transparent 1
  { from: /rgba\(30, 41, 59/g, to: 'rgba(17, 17, 17' }, // dark transparent 2
  { from: /#1e293b/g, to: '#111111' }, // bg-surface
  { from: /#3b82f6/g, to: '#d946ef' }, // primary-accent
  { from: /rgba\(59, 130, 246/g, to: 'rgba(217, 70, 239' }, // primary-accent rgba
  { from: /#9ca3af/g, to: '#a1a1aa' }, // text-secondary
  { from: /#cbd5e1/g, to: '#a1a1aa' }, // text-secondary alt
  { from: /rgba\(255, 255, 255, 0\.1\)/g, to: '#333333' } // borders
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      replacements.forEach(r => {
        content = content.replace(r.from, r.to);
      });
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  });
}

processDirectory(path.join(__dirname, '../app'));
