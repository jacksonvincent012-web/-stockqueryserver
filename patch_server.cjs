const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\(\["\/api\/signup", "\/api\/auth\/register"\], async \(req, res\) => \{[\s\S]*?\}\);/m;

const replacement = `
  app.post("/api/register/user", async (req, res) => {
    try {
      const { firstName, lastName, username, email, phone, country, preferredCurrency, password } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "193.186.4.92";
      const userAgent = req.headers['user-agent'] || "";

      const result = await enterpriseAuthService.registerUser({
        firstName, lastName, username, email, phone, country, preferredCurrency, password
      }, { ip: typeof ip === 'string' ? ip : ip[0], userAgent });

      if (result.success) {
        return res.json({ success: true, message: "Your SQ Platform account has been created successfully. Please verify your email before signing in." });
      } else {
        return res.status(400).json({ error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ error: "Registration error: " + err.message });
    }
  });

  app.post("/api/register/analyst", async (req, res) => {
    try {
      const { firstName, lastName, company, jobTitle, email, phone, country, professionalLicense, yearsOfExperience, password } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "193.186.4.92";
      const userAgent = req.headers['user-agent'] || "";

      const result = await enterpriseAuthService.registerAnalyst({
        firstName, lastName, company, jobTitle, email, phone, country, professionalLicense, yearsOfExperience, password
      }, { ip: typeof ip === 'string' ? ip : ip[0], userAgent });

      if (result.success) {
        return res.json({ success: true, message: "Your application for an Analyst account has been submitted and is pending approval." });
      } else {
        return res.status(400).json({ error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ error: "Registration error: " + err.message });
    }
  });

  app.post("/api/register/admin-request", async (req, res) => {
    try {
      const { fullName, organization, email, phone, position, reasonForAccess } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "193.186.4.92";
      const userAgent = req.headers['user-agent'] || "";

      const result = await enterpriseAuthService.requestAdminAccess({
        fullName, organization, email, phone, position, reasonForAccess
      }, { ip: typeof ip === 'string' ? ip : ip[0], userAgent });

      if (result.success) {
        return res.json({ success: true, message: "Your request for Administrator access has been submitted." });
      } else {
        return res.status(400).json({ error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ error: "Request error: " + err.message });
    }
  });
`;

code = code.replace(regex, replacement.trim());

fs.writeFileSync('server.ts', code);
