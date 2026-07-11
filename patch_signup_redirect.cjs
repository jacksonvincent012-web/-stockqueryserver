const fs = require('fs');
let code = fs.readFileSync('src/pages/SignUp.tsx', 'utf8');

code = code.replace(
  'setSuccessMessage(data.message);\n        setSuccess(true);',
  'navigate("/verify-email");'
);

fs.writeFileSync('src/pages/SignUp.tsx', code);
