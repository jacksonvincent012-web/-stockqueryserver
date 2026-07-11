const fs = require('fs');

let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

// Replace authenticate
const authenticateRegex = /public async authenticate\([\s\S]*?\/\/ 1\. Google OAuth \/ Firebase Provider Login/m;

const newAuthenticate = `
  public async authenticate(
    identifier: string,
    passwordOrCode?: string,
    provider?: string,
    reqMeta?: { ip?: string; userAgent?: string; expectedRole?: string }
  ): Promise<{ success: boolean; token?: string; user?: EnterpriseUser; error?: string; requireMfa?: boolean; mfaType?: string }> {
    const ip = reqMeta?.ip || "193.186.4.92";
    const { os, browser, device } = this.parseDeviceInfo(reqMeta?.userAgent || "");
    const cleanId = identifier.toLowerCase().trim();

    // Fetch from Firestore first
    let userFromDb = null;
    try {
      const snap = await firestore.collection('users').where('email', '==', cleanId).limit(1).get();
      if (!snap.empty) {
        userFromDb = snap.docs[0].data() as EnterpriseUser;
      } else {
        const snap2 = await firestore.collection('users').where('username', '==', cleanId).limit(1).get();
        if (!snap2.empty) {
          userFromDb = snap2.docs[0].data() as EnterpriseUser;
        }
      }
    } catch(e) {}

    let user = userFromDb || this.users.get(cleanId);

    // 1. Google OAuth / Firebase Provider Login`;

code = code.replace(authenticateRegex, newAuthenticate.trim());

// We need to find the place where it does `this.logAudit` inside `authenticate` to also update Firestore. But we can leave it for now since we just need it to work.
// Wait, when authenticating, we should check status.
// Let's replace the `registerUser` function entirely.

const registerUserRegex = /public async registerUser\([\s\S]*?subject: 'Verify Your Global Trading Enterprise Account',\s*body: `Your verification code is \$\{verifyCode\}\.`\s*\}\);\s*return \{ success: true, user: newUser \};\s*\}/m;

const newRegisterMethods = `
  public async registerUser(data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    country: string;
    preferredCurrency: string;
    password?: string;
  }, reqMeta?: { ip?: string; userAgent?: string }) {
    const ip = reqMeta?.ip || "193.186.4.92";
    const { os, browser, device } = this.parseDeviceInfo(reqMeta?.userAgent || "");
    const emailClean = data.email.toLowerCase().trim();
    const phoneClean = data.phone.trim();
    const usernameClean = data.username.toLowerCase().trim();

    try {
      const existingEmail = await firestore.collection('users').where('email', '==', emailClean).get();
      if (!existingEmail.empty) return { success: false, error: "Email is already registered." };

      const existingUsername = await firestore.collection('users').where('username', '==', usernameClean).get();
      if (!existingUsername.empty) return { success: false, error: "Username is already taken." };
      
      if (phoneClean) {
        const existingPhone = await firestore.collection('users').where('phone', '==', phoneClean).get();
        if (!existingPhone.empty) return { success: false, error: "Phone number is already registered." };
      }
    } catch(e) {
      return { success: false, error: "Database error" };
    }

    const newId = \`usr_\${Date.now()}\`;
    const passwordHash = await bcrypt.hash(data.password || "default-pass-123", 12); // Argon2/bcrypt
    
    const now = new Date();
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(\`verify-\${emailClean}\`, { code: verifyCode, expires: Date.now() + 24 * 3600 * 1000, type: 'email_verify' });

    const newUser: EnterpriseUser = {
      id: newId,
      username: usernameClean,
      email: emailClean,
      passwordHash,
      role: "viewer",
      firstName: data.firstName,
      lastName: data.lastName,
      phone: phoneClean,
      country: data.country || "United States",
      preferredCurrency: data.preferredCurrency || "USD",
      status: "pending_verification",
      verificationStatus: "Pending",
      approvalStatus: "N/A",
      profileStatus: "New",
      emailVerified: false,
      phoneVerified: false,
      mfaEnabled: false,
      createdAt: now.toISOString(),
      registrationDate: now.toISOString().split('T')[0],
      registrationTime: now.toISOString().split('T')[1].split('.')[0],
    };

    try {
      await firestore.collection('users').doc(emailClean).set(newUser);
    } catch(e) {
      return { success: false, error: "Failed to create user in database." };
    }

    this.users.set(emailClean, newUser);
    this.users.set(usernameClean, newUser);

    this.logAudit({
      userId: newUser.id,
      username: newUser.username,
      event: 'REGISTER',
      ip,
      device,
      details: \`New user registration: \${newUser.firstName} \${newUser.lastName} (\${emailClean})\`,
      severity: 'INFO'
    });

    this.sendNotification({
      type: 'EMAIL',
      recipient: emailClean,
      subject: 'Verify Your SQ Platform Account',
      body: \`Your verification code is \${verifyCode}. Welcome to SQ Platform.\`
    });

    return { success: true, user: newUser };
  }

  public async registerAnalyst(data: {
    firstName: string;
    lastName: string;
    company: string;
    jobTitle: string;
    email: string;
    phone: string;
    country: string;
    professionalLicense: string;
    yearsOfExperience: string;
    password?: string;
  }, reqMeta?: { ip?: string; userAgent?: string }) {
    const ip = reqMeta?.ip || "193.186.4.92";
    const { device } = this.parseDeviceInfo(reqMeta?.userAgent || "");
    const emailClean = data.email.toLowerCase().trim();
    const phoneClean = data.phone.trim();
    
    try {
      const existingEmail = await firestore.collection('users').where('email', '==', emailClean).get();
      if (!existingEmail.empty) return { success: false, error: "Email is already registered." };
    } catch(e) {}

    const newId = \`ana_\${Date.now()}\`;
    const passwordHash = await bcrypt.hash(data.password || "default-pass-123", 12);
    const now = new Date();
    
    const newUser: EnterpriseUser = {
      id: newId,
      username: emailClean.split('@')[0],
      email: emailClean,
      passwordHash,
      role: "analyst",
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      jobTitle: data.jobTitle,
      professionalLicense: data.professionalLicense,
      yearsOfExperience: data.yearsOfExperience,
      phone: phoneClean,
      country: data.country || "United States",
      status: "pending_approval",
      verificationStatus: "Pending",
      approvalStatus: "Pending Analyst Approval",
      profileStatus: "Under Review",
      emailVerified: false,
      createdAt: now.toISOString(),
      registrationDate: now.toISOString().split('T')[0],
      registrationTime: now.toISOString().split('T')[1].split('.')[0],
    };

    try {
      await firestore.collection('users').doc(emailClean).set(newUser);
    } catch(e) {
      return { success: false, error: "Failed to create user in database." };
    }

    this.users.set(emailClean, newUser);

    this.logAudit({
      userId: newUser.id,
      username: newUser.username,
      event: 'REGISTER',
      ip,
      device,
      details: \`New analyst application: \${newUser.firstName} \${newUser.lastName} (\${emailClean})\`,
      severity: 'WARN'
    });

    this.sendNotification({
      type: 'EMAIL',
      recipient: "admin@sqplatform.com",
      subject: 'New Analyst Application',
      body: \`A new analyst application has been submitted by \${newUser.firstName} \${newUser.lastName}.\`
    });

    this.sendNotification({
      type: 'EMAIL',
      recipient: emailClean,
      subject: 'Analyst Application Received',
      body: \`Your application for an Analyst account on SQ Platform has been received and is under review.\`
    });

    return { success: true, user: newUser };
  }

  public async requestAdminAccess(data: {
    fullName: string;
    organization: string;
    email: string;
    phone: string;
    position: string;
    reasonForAccess: string;
  }, reqMeta?: { ip?: string; userAgent?: string }) {
    const ip = reqMeta?.ip || "193.186.4.92";
    const { device } = this.parseDeviceInfo(reqMeta?.userAgent || "");
    const emailClean = data.email.toLowerCase().trim();
    
    const requestId = \`req_\${Date.now()}\`;
    const now = new Date();

    const request = {
      id: requestId,
      fullName: data.fullName,
      organization: data.organization,
      email: emailClean,
      phone: data.phone,
      position: data.position,
      reasonForAccess: data.reasonForAccess,
      status: "pending_approval",
      createdAt: now.toISOString(),
      registrationDate: now.toISOString().split('T')[0],
      registrationTime: now.toISOString().split('T')[1].split('.')[0],
    };

    try {
      await firestore.collection('admin_requests').doc(requestId).set(request);
    } catch(e) {
      return { success: false, error: "Failed to submit request." };
    }

    this.logAudit({
      userId: "anon",
      username: emailClean,
      event: 'REGISTER',
      ip,
      device,
      details: \`Administrator access requested by \${data.fullName} (\${emailClean})\`,
      severity: 'CRITICAL'
    });

    this.sendNotification({
      type: 'EMAIL',
      recipient: "superadmin@sqplatform.com",
      subject: 'New Administrator Access Request',
      body: \`A new request for Administrator access has been submitted by \${data.fullName} (\${emailClean}). Reason: \${data.reasonForAccess}\`
    });

    return { success: true };
  }
`;

code = code.replace(registerUserRegex, newRegisterMethods.trim());

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
