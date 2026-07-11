const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

let regex = /const \{ firstName, lastName, username, email, phone, country, preferredCurrency, password \} = req\.body;/g;
let replacement = `const { firstName, lastName, username, email, phone, country, preferredCurrency, password, photoURL } = req.body;`;
code = code.replace(regex, replacement);

regex = /firstName, lastName, username, email, phone, country, preferredCurrency, password\s*\}/g;
replacement = `firstName, lastName, username, email, phone, country, preferredCurrency, password, photoURL\n      }`;
code = code.replace(regex, replacement);

regex = /const \{ fullName, organization, email, phone, position, reasonForAccess \} = req\.body;/;
replacement = `const { fullName, organization, email, phone, position, reasonForAccess, photoURL } = req.body;`;
code = code.replace(regex, replacement);

regex = /fullName, organization, email, phone, position, reasonForAccess\s*\}/;
replacement = `fullName, organization, email, phone, position, reasonForAccess, photoURL\n      }`;
code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
