const fs = require('fs');

const loginFooter = `
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Create Account</Link>
              <button
                type="button"
                onClick={() => openRecoveryModal(email)}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Forgot Password
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              </div>
              <a href="#" className="hover:text-indigo-600 transition-colors">System Status</a>
            </div>
            <div className="mt-2 text-center">
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Main Login</Link>
              <span className="mx-2">•</span>
              <Link to="/admin-login" className="text-indigo-600 font-semibold hover:underline">Administrator Login</Link>
            </div>
          </div>
        </div>
      </div>`;

const adminFooter = `
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <a href="#" className="text-indigo-600 font-semibold hover:underline">Request Access</a>
              <button
                type="button"
                onClick={() => openRecoveryModal(email)}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Forgot Password
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              </div>
              <a href="#" className="hover:text-indigo-600 transition-colors">System Status</a>
            </div>
            <div className="mt-2 text-center">
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Main Login</Link>
              <span className="mx-2">•</span>
              <Link to="/analyst-login" className="text-indigo-600 font-semibold hover:underline">Analyst Login</Link>
            </div>
          </div>
        </div>
      </div>`;

function updateAnalyst() {
  let content = fs.readFileSync('src/pages/AnalystLogin.tsx', 'utf8');
  content = content.replace(/<div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-500">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, loginFooter.trim());
  fs.writeFileSync('src/pages/AnalystLogin.tsx', content);
}

function updateAdmin() {
  let content = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');
  content = content.replace(/<div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-500">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, adminFooter.trim());
  fs.writeFileSync('src/pages/AdminLogin.tsx', content);
}

updateAnalyst();
updateAdmin();
