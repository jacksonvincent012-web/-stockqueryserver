const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const \{ firstName, lastName, company, jobTitle, email, phone, country, professionalLicense, yearsOfExperience, password \} = req\.body;/,
  `const { firstName, lastName, company, jobTitle, email, phone, country, professionalLicense, yearsOfExperience, password, photoURL } = req.body;`
);

code = code.replace(
  /firstName, lastName, company, jobTitle, email, phone, country, professionalLicense, yearsOfExperience, password/g,
  `firstName, lastName, company, jobTitle, email, phone, country, professionalLicense, yearsOfExperience, password, photoURL`
);

fs.writeFileSync('server.ts', code);
