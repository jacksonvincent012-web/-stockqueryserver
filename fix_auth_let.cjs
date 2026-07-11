const fs = require('fs');
let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

// The original authenticate function has block scoped variable shadows or re-declarations.
// We can just remove "const user = this.users.get(cleanId);" in the rest of the function if it's the main block.
// Wait, the original authenticate function had "let user = this.users.get(cleanId);" inside the "if (provider === "google")" block!
// And "const user = this.users.get(cleanId);" at the bottom for standard login.
// Let's replace "const user = this.users.get(cleanId);" with "user = user || this.users.get(cleanId);" at line 343 or so.

code = code.replace(/const user = this\.users\.get\(cleanId\);/g, 'user = user || this.users.get(cleanId);');

// For the block scoped "let user = this.users.get(cleanId);", we can just do "user = this.users.get(cleanId) || user;"
// Wait, since we declared "let user" at the top of authenticate, we can just remove "let" from those inner blocks.
code = code.replace(/let user = this\.users\.get\(cleanId\);/g, 'user = user || this.users.get(cleanId);');

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
