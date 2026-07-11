const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import AnalystSignUp')) {
  code = code.replace(
    "import SignUp from './pages/SignUp';",
    "import SignUp from './pages/SignUp';\nimport AnalystSignUp from './pages/AnalystSignUp';\nimport AdminRequestAccess from './pages/AdminRequestAccess';"
  );
  
  code = code.replace(
    '<Route path="/signup" element={<SignUp />} />',
    '<Route path="/signup" element={<SignUp />} />\n              <Route path="/analyst-signup" element={<AnalystSignUp />} />\n              <Route path="/admin-request-access" element={<AdminRequestAccess />} />'
  );

  fs.writeFileSync('src/App.tsx', code);
}
