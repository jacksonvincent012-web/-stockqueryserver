const fs = require('fs');

let code = fs.readFileSync('src/pages/SignUp.tsx', 'utf8');

// Replace handleRegister
const handleRegex = /const handleRegister = async \(\w+: React\.FormEvent\) => \{[\s\S]*?\}\s*catch \(err\) \{[\s\S]*?\}\s*\};/;

const newHandle = `const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, username, email, phone, country, preferredCurrency: 'USD', password
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to register');
      }
    } catch (err) {
      setError('Server connection failed');
    } finally {
      setLoading(false);
    }
  };`;

code = code.replace(handleRegex, newHandle);

// Add preferred currency
const ccRegex = /<option value="AE">UAE<\/option>\s*<\/select>\s*<\/div>\s*<\/div>/;
const newCc = `<option value="AE">UAE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Currency</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>`;

code = code.replace(ccRegex, newCc);

// Fix grid cols
const gridColsRegex = /<div className="grid grid-cols-2 gap-4">[\s\S]*?Username[\s\S]*?<\/div>\s*<\/div>/;
// I'll just leave grid layout as is for now and let the CC be there since I just replaced that block to include a third item in a 2-col grid?
// No, the grid is 2 cols, so 3 items will wrap. It's fine.

fs.writeFileSync('src/pages/SignUp.tsx', code);
