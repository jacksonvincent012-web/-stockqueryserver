const fs = require('fs');

let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

if (!code.includes('import { firestore }')) {
  code = code.replace('import { dbManager } from "../database/index";', 'import { dbManager } from "../database/index";\nimport { firestore } from "../database/firebaseAdmin";');
}

// Update the type status
code = code.replace(
  "status: 'active' | 'suspended' | 'pending_verification';", 
  "status: 'active' | 'suspended' | 'pending_verification' | 'verified' | 'pending_approval' | 'approved' | 'disabled';"
);

// We need to add new fields to EnterpriseUser
code = code.replace(
  "lastName?: string;", 
  "lastName?: string;\n  company?: string;\n  jobTitle?: string;\n  professionalLicense?: string;\n  yearsOfExperience?: string;\n  position?: string;\n  reasonForAccess?: string;\n  registrationDate?: string;\n  registrationTime?: string;\n  verificationStatus?: string;\n  approvalStatus?: string;\n  profileStatus?: string;"
);

// Overwrite initDefaultUsers to sync default users to Firestore, just in case
const initDefaultUsersStr = `  private async initDefaultUsers() {
    const adminHash = await bcrypt.hash("admin123", 10);
    const analystHash = await bcrypt.hash("analyst123", 10);
    const viewerHash = await bcrypt.hash("viewer123", 10);
    const defaultUsers: EnterpriseUser[] = [
      {
        id: "1",
        username: "admin",
        email: "admin@globaltrading.enterprise",
        passwordHash: adminHash,
        role: "admin",
        firstName: "Alexander",
        lastName: "Wright",
        phone: "+1-555-0101",
        country: "United States",
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        mfaEnabled: true,
        mfaType: "app",
        preferredCurrency: "USD",
        preferredLanguage: "English (US)",
        timeZone: "America/New_York",
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        username: "analyst",
        email: "analyst@globaltrading.enterprise",
        passwordHash: analystHash,
        role: "analyst",
        firstName: "Elena",
        lastName: "Rostova",
        phone: "+44-20-7946-0102",
        country: "United Kingdom",
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        mfaEnabled: false,
        preferredCurrency: "GBP",
        preferredLanguage: "English (UK)",
        timeZone: "Europe/London",
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        username: "viewer",
        email: "viewer@globaltrading.enterprise",
        passwordHash: viewerHash,
        role: "viewer",
        firstName: "Christian",
        lastName: "Smith",
        phone: "+1-555-0103",
        country: "Canada",
        status: "active",
        emailVerified: true,
        phoneVerified: false,
        mfaEnabled: false,
        preferredCurrency: "CAD",
        preferredLanguage: "English (US)",
        timeZone: "America/Toronto",
        createdAt: new Date().toISOString()
      }
    ];
    defaultUsers.forEach(u => {
      this.users.set(u.username.toLowerCase(), u);
      this.users.set(u.email.toLowerCase(), u);
      if (u.phone) this.users.set(u.phone, u);
    });

    // Also persist defaults to firestore
    try {
      for (const u of defaultUsers) {
        await firestore.collection('users').doc(u.email).set(u, { merge: true });
      }
    } catch(e) {}
  }`;

code = code.replace(/private async initDefaultUsers\(\) \{[\s\S]*?this\.users\.set\(u\.phone, u\);\n\s*\}\);\n\s*\}/, initDefaultUsersStr);

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
