const fs = require('fs');
const content = fs.readFileSync('src/components/admin/AdminSidebar.jsx', 'utf8');
const lines = content.split('\n');

function countSection(startLine, endLine, label) {
  let stack = [];
  let errors = [];
  for (let i = startLine - 1; i < endLine && i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    // Strip string literals so their contents don't confuse paren/brace counting
    let simple = line.replace(/`[^`]*`/g, 'STR');
    simple = simple.replace(/'[^']*'/g, "STR");
    simple = simple.replace(/"[^"]*"/g, 'STR');
    for (let j = 0; j < simple.length; j++) {
      const ch = simple[j];
      if (ch === '(' || ch === '{') {
        stack.push({ ch, line: lineNum });
      } else if (ch === ')') {
        const top = stack.pop();
        if (!top || top.ch !== '(') {
          errors.push(`LINE ${lineNum}: ) mismatch, expected ( got ${top ? top.ch : 'stack empty'}`);
        }
      } else if (ch === '}') {
        const top = stack.pop();
        if (!top || top.ch !== '{') {
          errors.push(`LINE ${lineNum}: } mismatch, expected { got ${top ? top.ch : 'stack empty'}`);
        }
      }
    }
  }
  console.log(`=== ${label} (lines ${startLine}-${endLine}) ===`);
  console.log('Remaining stack depth:', stack.length);
  stack.forEach(s => console.log('  Unclosed', s.ch, 'at line', s.line));
  errors.forEach(e => console.log('  ERR:', e));
  console.log('');
}

// Desktop nav block: <nav> ... </nav>
countSection(204, 282, 'Desktop nav block');
// Mobile drawer block: {isOpen && ( ... )}
countSection(321, 426, 'Mobile drawer block');
