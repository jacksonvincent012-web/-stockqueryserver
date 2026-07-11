const fs = require('fs');
let code = fs.readFileSync('src/components/MultiStockGrid.tsx', 'utf8');

// The original pattern was className="w-11 h-11 rounded-xl ... "
// Now it's something like className={`w-11 h-11 rounded-xl ${className} ... ${className}`} or with " at the end

code = code.replace(/className=\{`w-11 h-11 rounded-xl \$\{className\} (.*?) \$\{className\}`\}/g, 'className={`w-11 h-11 rounded-xl ${className} $1`}');
code = code.replace(/className=\{`w-11 h-11 rounded-xl \$\{className\} (.*?)`\}/g, 'className={`w-11 h-11 rounded-xl ${className} $1`}');
code = code.replace(/className=\{`w-11 h-11 rounded-xl \$\{className\} (.*?)">/g, 'className={`w-11 h-11 rounded-xl ${className} $1`}>');

fs.writeFileSync('src/components/MultiStockGrid.tsx', code);
