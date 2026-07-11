const fs = require('fs');
let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

const newMethods = `
  public async registerAnalyst(data: any, reqMeta?: { ip?: string; userAgent?: string }) {
    const result = await this.registerUser({
      ...data,
      role: 'analyst',
      username: data.email.split('@')[0] + "_analyst_" + Math.floor(100 + Math.random() * 900)
    }, reqMeta);
    
    if (result.success) {
      const emailClean = data.email.toLowerCase().trim();
      const user = this.users.get(emailClean);
      if (user) {
        user.company = data.company;
        user.jobTitle = data.jobTitle;
        user.professionalLicense = data.professionalLicense;
        user.yearsOfExperience = data.yearsOfExperience;
        user.approvalStatus = 'pending';
        // Send email to admin
        this.sendNotification({
          type: 'EMAIL',
          recipient: 'admin@sqplatform.com',
          subject: 'New Analyst Registration Pending Approval',
          body: \`Analyst \${data.firstName} \${data.lastName} (\${data.email}) requested access.\`
        });
      }
    }
    return result;
  }

  public async requestAdminAccess(data: any, reqMeta?: { ip?: string; userAgent?: string }) {
    const nameParts = data.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const result = await this.registerUser({
      firstName,
      lastName,
      email: data.email,
      phone: data.phone,
      country: "US", // Default or extract if possible
      role: 'admin',
      password: "admin_request_pass_" + Date.now(),
      username: data.email.split('@')[0] + "_admin_" + Math.floor(100 + Math.random() * 900)
    }, reqMeta);

    if (result.success) {
      const emailClean = data.email.toLowerCase().trim();
      const user = this.users.get(emailClean);
      if (user) {
        user.company = data.organization;
        user.position = data.position;
        user.reasonForAccess = data.reasonForAccess;
        user.photoURL = data.photoURL;
        user.approvalStatus = 'pending';
        
        this.sendNotification({
          type: 'EMAIL',
          recipient: 'superadmin@sqplatform.com',
          subject: 'New Administrator Access Request',
          body: \`User \${data.fullName} (\${data.email}) requested administrator access. Reason: \${data.reasonForAccess}\`
        });
      }
    }
    return result;
  }
`;

// Insert the methods right before the last closing brace
code = code.replace(/}\s*$/, newMethods + '\n}\n');

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
