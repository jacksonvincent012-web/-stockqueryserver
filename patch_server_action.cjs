const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/admin\/enterprise-users\/action", authenticateToken, requireAdmin, \(req: any, res\) => \{[\s\S]*?\}\);/m;

const replacement = `app.post("/api/admin/enterprise-users/action", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { userId, action, payload } = req.body;
      const result = await enterpriseAuthService.adminUserAction(req.user?.username, userId, action, payload);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });`;

code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
