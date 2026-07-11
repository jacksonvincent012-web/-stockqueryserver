const fs = require('fs');

let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

const regex = /public async registerUser\(data: \{[\s\S]*?\}, reqMeta\?: \{ ip\?: string; userAgent\?: string \}\) \{[\s\S]*?this\.users\.set\(username\.toLowerCase\(\), newUser\);\s*if \(phoneClean\) this\.users\.set\(phoneClean, newUser\);/m;

const replacement = `public async registerUser(data: {
    firstName: string;
    lastName: string;
    username?: string;
    email: string;
    phone: string;
    country: string;
    preferredCurrency?: string;
    password?: string;
    referralCode?: string;
    role?: 'admin' | 'analyst' | 'viewer';
  }, reqMeta?: { ip?: string; userAgent?: string }) {
    const ip = reqMeta?.ip || "193.186.4.92";
    const { device } = this.parseDeviceInfo(reqMeta?.userAgent || "");
    const emailClean = data.email.toLowerCase().trim();
    const phoneClean = data.phone.trim();
    const usernameClean = data.username ? data.username.trim() : emailClean.split('@')[0] + "_" + Math.floor(100 + Math.random() * 900);

    const emailRegex = /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/;
    if (!emailRegex.test(emailClean)) {
      return { success: false, error: "Invalid email format." };
    }

    const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
    if (phoneClean && !phoneRegex.test(phoneClean)) {
      return { success: false, error: "Invalid phone format. Please use international format." };
    }

    if (data.password && data.password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    if (this.users.get(emailClean)) {
      return { success: false, error: "An account with this email address already exists." };
    }
    if (phoneClean && this.users.get(phoneClean)) {
      return { success: false, error: "An account with this phone number is already registered." };
    }
    if (this.users.get(usernameClean.toLowerCase())) {
      return { success: false, error: "An account with this username already exists." };
    }

    const newId = "USR" + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
    const passwordHash = await bcrypt.hash(data.password || "default-pass-123", 10);

    // Generate 6-digit email verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(\`verify-\${emailClean}\`, { code: verifyCode, expires: Date.now() + 24 * 3600 * 1000, type: 'email_verify' });

    const newUser: EnterpriseUser = {
      id: newId,
      username: usernameClean,
      email: emailClean,
      passwordHash,
      role: data.role || "viewer",
      firstName: data.firstName,
      lastName: data.lastName,
      phone: phoneClean,
      country: data.country || "United States",
      status: "pending_verification",
      emailVerified: false,
      phoneVerified: false,
      mfaEnabled: false,
      referralCode: data.referralCode,
      preferredCurrency: data.preferredCurrency || "USD",
      preferredLanguage: "English (US)",
      timeZone: "America/New_York",
      createdAt: new Date().toISOString()
    };

    try {
      await firestore.collection('users').doc(emailClean).set(newUser);
    } catch(e) {}

    this.users.set(emailClean, newUser);
    this.users.set(usernameClean.toLowerCase(), newUser);
    if (phoneClean) this.users.set(phoneClean, newUser);

    // Send Welcome Email
    this.sendNotification({
      type: 'EMAIL',
      recipient: emailClean,
      subject: 'Welcome to SQ Platform',
      body: \`Hello \${data.firstName}, welcome to SQ Platform. We are glad to have you on board!\`
    });

    // Send Verification Email
    this.sendNotification({
      type: 'EMAIL',
      recipient: emailClean,
      subject: 'Verify your Email Address',
      body: \`Your verification code is: \${verifyCode}. Please enter this code to verify your account.\`
    });`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
