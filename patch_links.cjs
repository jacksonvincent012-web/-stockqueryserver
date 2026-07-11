const fs = require('fs');

let ana = fs.readFileSync('src/pages/AnalystLogin.tsx', 'utf8');
ana = ana.replace('<Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Request Account</Link>', '<Link to="/analyst-signup" className="text-indigo-600 font-semibold hover:underline">Request Account</Link>');
fs.writeFileSync('src/pages/AnalystLogin.tsx', ana);

let adm = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');
adm = adm.replace('<a href="#" className="text-indigo-600 font-semibold hover:underline">Request Access</a>', '<Link to="/admin-request-access" className="text-indigo-600 font-semibold hover:underline">Request Access</Link>');
fs.writeFileSync('src/pages/AdminLogin.tsx', adm);
