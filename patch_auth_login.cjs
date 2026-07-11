const fs = require('fs');

let code = fs.readFileSync('server/backend/EnterpriseAuthService.ts', 'utf8');

const regex = /if \(user.status === "suspended"\) \{\s*return \{ success: false, error: "Account suspended. Please contact administrator." \};\s*\}/m;

const replacement = `if (user.status === "suspended") {
      return { success: false, error: "Account suspended. Please contact administrator." };
    }
    if (user.status === "pending_approval" || user.approvalStatus === "Pending Analyst Approval") {
      return { success: false, error: "Account is pending administrator approval." };
    }
    if (user.status === "disabled") {
      return { success: false, error: "Account has been disabled." };
    }`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/backend/EnterpriseAuthService.ts', code);
