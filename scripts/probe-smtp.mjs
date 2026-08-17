import fs from 'node:fs';
import nodemailer from 'nodemailer';

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      const key = l.slice(0, i);
      const value = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      return [key, value];
    }),
);

const host = env.SMTP_HOST;
const user = env.SMTP_USER;
const pass = env.SMTP_PASSWORD;
const from = env.SMTP_FROM || user;
const port = Number(env.SMTP_PORT || 587);
const secure = env.SMTP_SECURE === 'true' || port === 465;

console.log(
  JSON.stringify({
    host,
    port,
    secure,
    userSet: Boolean(user),
    passLen: (pass || '').length,
    fromSet: Boolean(from),
  }),
);

for (const cfg of [
  { port, secure, requireTLS: !secure && port === 587 },
  { port: 465, secure: true, requireTLS: false },
  { port: 587, secure: false, requireTLS: true },
]) {
  const transporter = nodemailer.createTransport({
    host,
    port: cfg.port,
    secure: cfg.secure,
    requireTLS: cfg.requireTLS,
    auth: { user, pass },
  });
  try {
    await transporter.verify();
    console.log('VERIFY_OK', JSON.stringify(cfg));
    process.exit(0);
  } catch (error) {
    console.log(
      'VERIFY_FAIL',
      cfg.port,
      error instanceof Error ? error.message : String(error),
    );
  }
}
