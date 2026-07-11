const fs = require('fs');
let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

const regex = /role\?: 'admin' \| 'analyst' \| 'viewer';\s*\}/;
const replacement = `role?: 'admin' | 'analyst' | 'viewer';\n    photoURL?: string;\n  }`;

code = code.replace(regex, replacement);

const regex2 = /firstName: data\.firstName,\s*lastName: data\.lastName,/;
const replacement2 = `firstName: data.firstName,\n      lastName: data.lastName,\n      photoURL: data.photoURL || null,`;

code = code.replace(regex2, replacement2);

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
