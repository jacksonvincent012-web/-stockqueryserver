const fs = require('fs');

let code = fs.readFileSync('src/components/auth/OnboardingWizardModal.tsx', 'utf8');

if (!code.includes("import ProfilePhotoUpload")) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport ProfilePhotoUpload from '../ProfilePhotoUpload';");
}

const regex = /<div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/;

const replacement = `<ProfilePhotoUpload photoURL={photoURL} setPhotoURL={setPhotoURL} size="md" />`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/auth/OnboardingWizardModal.tsx', code);
