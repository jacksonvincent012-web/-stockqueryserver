const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<Route path="\/signup" element=\{isAuthenticated \? <Navigate to=\{defaultDash\} replace \/> : <SignUp \/>\} \/>/;

const replacement = `<Route path="/signup" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <SignUp />} />
      <Route path="/verify-email" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <EmailVerification />} />
      <Route path="/analyst-signup" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <AnalystSignUp />} />
      <Route path="/admin-request-access" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <AdminRequestAccess />} />`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
