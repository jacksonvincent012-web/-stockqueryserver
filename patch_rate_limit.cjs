const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/register\/user", async \(req, res\) => \{/m;

const rateLimitCode = `
// Simple Rate Limiting for Registration
const registrationLimits = new Map<string, { count: number, resetTime: number }>();

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const record = registrationLimits.get(ip);
  if (record) {
    if (now > record.resetTime) {
      registrationLimits.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
      return true;
    }
    if (record.count >= 5) { // 5 attempts per 15 minutes
      return false;
    }
    record.count++;
    return true;
  }
  registrationLimits.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
  return true;
};

app.post("/api/register/user", async (req, res) => {
  const ipStr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "193.186.4.92";
  const ip = typeof ipStr === 'string' ? ipStr : ipStr[0];
  if (!checkRateLimit(ip)) return res.status(429).json({ error: "Too many registration attempts. Please try again later." });
`;

code = code.replace(regex, rateLimitCode);

const analystRegex = /app\.post\("\/api\/register\/analyst", async \(req, res\) => \{/m;
const adminRegex = /app\.post\("\/api\/register\/admin-request", async \(req, res\) => \{/m;

const analystLimit = `app.post("/api/register/analyst", async (req, res) => {
  const ipStr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "193.186.4.92";
  const ip = typeof ipStr === 'string' ? ipStr : ipStr[0];
  if (!checkRateLimit(ip)) return res.status(429).json({ error: "Too many application attempts. Please try again later." });`;

const adminLimit = `app.post("/api/register/admin-request", async (req, res) => {
  const ipStr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "193.186.4.92";
  const ip = typeof ipStr === 'string' ? ipStr : ipStr[0];
  if (!checkRateLimit(ip)) return res.status(429).json({ error: "Too many requests. Please try again later." });`;

code = code.replace(analystRegex, analystLimit);
code = code.replace(adminRegex, adminLimit);

fs.writeFileSync('server.ts', code);
