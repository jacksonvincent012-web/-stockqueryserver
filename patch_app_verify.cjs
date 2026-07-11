const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import EmailVerification')) {
  code = code.replace(
    "import SignUp from './pages/SignUp';",
    "import SignUp from './pages/SignUp';\nimport EmailVerification from './pages/EmailVerification';"
  );
  
  code = code.replace(
    '<Route path="/signup" element={<SignUp />} />',
    '<Route path="/signup" element={<SignUp />} />\n              <Route path="/verify-email" element={<EmailVerification />} />'
  );

  fs.writeFileSync('src/App.tsx', code);
}
