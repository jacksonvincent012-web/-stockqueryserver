const fs = require('fs');
let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

code = code.replace(/user = user \|\| this\.users\.get\((.*?)\);/g, 'const user = this.users.get($1);');

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
