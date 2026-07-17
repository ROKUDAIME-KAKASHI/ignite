require('dotenv').config();
const { logAudit } = require('./.next/server/app/actions/auth.js') || {}; // Wait, this is compiled. Let's just run a script using ts-node or run it via Next.js
