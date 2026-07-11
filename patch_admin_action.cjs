const fs = require('fs');

let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

const regex = /public adminUserAction\([\s\S]*?return \{ success: true, user: safe \};\s*\}/m;

const replacement = `public async adminUserAction(adminUsername: string, targetUserId: string, action: 'approve_analyst' | 'suspend' | 'activate' | 'reset_mfa' | 'set_role', payload?: { role?: string }) {
    const target = Array.from(this.users.values()).find(u => u.id.toString() === targetUserId.toString());
    if (!target) return { success: false, error: "Target user not found" };

    if (action === 'approve_analyst') {
      target.role = 'analyst';
      target.status = 'active';
      target.approvalStatus = 'Approved';
      target.verificationStatus = 'Verified';
      target.profileStatus = 'Active';
    } else if (action === 'suspend') {
      target.status = 'suspended';
      this.revokeAllSessionsForUser(target.id);
    } else if (action === 'activate') {
      target.status = 'active';
      target.approvalStatus = 'Approved';
    } else if (action === 'reset_mfa') {
      target.mfaEnabled = false;
      target.mfaType = 'none';
    } else if (action === 'set_role' && payload?.role) {
      target.role = payload.role as any;
    }

    try {
      await firestore.collection('users').doc(target.email).set(target, { merge: true });
    } catch(e) {}

    this.logAudit({
      userId: target.id,
      username: target.username,
      event: 'ROLE_CHANGE',
      ip: "Admin Console",
      device: "System Admin Control",
      details: \`Admin \${adminUsername} executed action '\${action}' on user \${target.username} (New Role: \${target.role}, Status: \${target.status})\`,
      severity: 'CRITICAL'
    });

    if (action === 'approve_analyst') {
      this.sendNotification({
        type: 'EMAIL',
        recipient: target.email,
        subject: 'Analyst Account Approved',
        body: 'Your analyst account on SQ Platform has been approved. You can now log in.'
      });
    }

    const safe = { ...target };
    delete (safe as any).passwordHash;
    return { success: true, user: safe };
  }`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
