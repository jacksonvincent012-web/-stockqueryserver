const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalystSignUp.tsx', 'utf8');

if (!code.includes("import ProfilePhotoUpload")) {
  code = code.replace(
    "import { Activity, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';",
    "import { Activity, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';\nimport ProfilePhotoUpload from '../components/ProfilePhotoUpload';"
  );
}

if (!code.includes("const [photoURL")) {
  code = code.replace(
    "const [firstName, setFirstName] = useState('');",
    "const [firstName, setFirstName] = useState('');\n  const [photoURL, setPhotoURL] = useState<string | null>(null);"
  );
}

code = code.replace(
  "firstName, lastName, company, jobTitle, email, phone, country, professionalLicense, yearsOfExperience, password",
  "firstName, lastName, company, jobTitle, email, phone, country, professionalLicense, yearsOfExperience, password, photoURL"
);

if (!code.includes("<ProfilePhotoUpload")) {
  code = code.replace(
    /<div className="grid grid-cols-2 gap-4">\s*<div>\s*<label className="block text-xs font-bold text-slate-700 mb-1\.5">First Name<\/label>/,
    `<div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-3">Profile Photo (Recommended)</label>
              <ProfilePhotoUpload photoURL={photoURL} setPhotoURL={setPhotoURL} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>`
  );
}

fs.writeFileSync('src/pages/AnalystSignUp.tsx', code);
