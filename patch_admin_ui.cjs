const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminRequestAccess.tsx', 'utf8');

if (!code.includes("import ProfilePhotoUpload")) {
  code = code.replace(
    "import { Shield, CheckCircle, AlertCircle } from 'lucide-react';",
    "import { Shield, CheckCircle, AlertCircle } from 'lucide-react';\nimport ProfilePhotoUpload from '../components/ProfilePhotoUpload';"
  );
}

if (!code.includes("const [photoURL")) {
  code = code.replace(
    "const [fullName, setFullName] = useState('');",
    "const [fullName, setFullName] = useState('');\n  const [photoURL, setPhotoURL] = useState<string | null>(null);"
  );
}

code = code.replace(
  "fullName, organization, email, phone, position, reasonForAccess",
  "fullName, organization, email, phone, position, reasonForAccess, photoURL"
);

if (!code.includes("<ProfilePhotoUpload")) {
  code = code.replace(
    /<div>\s*<label className="block text-xs font-bold text-slate-700 mb-1\.5">Full Legal Name<\/label>/,
    `<div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-3">Profile Photo (Optional)</label>
              <ProfilePhotoUpload photoURL={photoURL} setPhotoURL={setPhotoURL} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Legal Name</label>`
  );
}

fs.writeFileSync('src/pages/AdminRequestAccess.tsx', code);
