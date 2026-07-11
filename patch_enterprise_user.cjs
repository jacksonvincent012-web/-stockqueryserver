const fs = require('fs');
let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

const regex = /role: 'admin' \| 'analyst' \| 'viewer' \| 'user';/;
const replacement = `role: 'admin' | 'analyst' | 'viewer' | 'user';\n  photoURL?: string | null;`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
