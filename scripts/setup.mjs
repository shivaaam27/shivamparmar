// One-step setup for working on this site on your own computer.
//   npm run setup
// Checks Node, installs packages, and creates .env.local from .env.example
// (only if you don't have one yet — it never overwrites your settings).
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  console.error(`Node ${process.versions.node} is too old. Install Node 22 from https://nodejs.org and run this again.`);
  process.exit(1);
}

console.log('Installing packages…');
execSync('npm install --no-audit --no-fund', { stdio: 'inherit' });

if (existsSync('.env.local')) {
  console.log('.env.local already exists — left as is.');
} else {
  copyFileSync('.env.example', '.env.local');
  console.log('Created .env.local from .env.example. The site runs without filling it in;');
  console.log('fill it (or run `npx vercel env pull .env.local`) only if you need /insights locally.');
}

console.log('\nReady. Start the site with:  npm run dev   → http://localhost:3000');
