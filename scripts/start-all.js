#!/usr/bin/env node

/**
 * CSHRK Universal Full-Stack Service Runner
 * Boots PostgreSQL in Docker, builds shared packages, runs DB seed,
 * and concurrently runs API (NestJS), Admin Web (Vite), and AI Service (FastAPI).
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function log(prefix, color, message) {
  console.log(`${color}${COLORS.bold}[${prefix}]${COLORS.reset} ${message}`);
}

console.log(`
${COLORS.cyan}${COLORS.bold}================================================================${COLORS.reset}
${COLORS.cyan}${COLORS.bold}  CSHRK — Cooperative Labour & Service Marketplace Launcher${COLORS.reset}
${COLORS.cyan}${COLORS.bold}================================================================${COLORS.reset}
`);

// 1. Check Docker & Start PostgreSQL
log('SYSTEM', COLORS.blue, 'Verifying Docker and PostgreSQL PostGIS container...');
try {
  execSync('docker compose -f infrastructure/docker/docker-compose.yml up -d postgres', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
  log('DOCKER', COLORS.green, 'PostgreSQL PostGIS 16-3.4 container is healthy on port 5432.');
} catch (err) {
  log('DOCKER', COLORS.yellow, 'Warning: Could not start Docker container automatically. Ensure PostgreSQL is running on port 5432.');
}

// 2. Build Shared Packages
log('BUILD', COLORS.blue, 'Compiling shared packages (@cshrk/types, @cshrk/config, @cshrk/validation)...');
try {
  execSync('npm run build --workspace=@cshrk/types', { cwd: ROOT_DIR, stdio: 'pipe' });
  execSync('npm run build --workspace=@cshrk/config', { cwd: ROOT_DIR, stdio: 'pipe' });
  execSync('npm run build --workspace=@cshrk/validation', { cwd: ROOT_DIR, stdio: 'pipe' });
  log('BUILD', COLORS.green, 'Shared packages compiled successfully.');
} catch (err) {
  log('BUILD', COLORS.red, 'Error compiling shared packages. Proceeding with existing dist files...');
}

// 3. Database Seed
if (process.argv.includes('--seed')) {
  log('SEED', COLORS.blue, 'Seeding database with demo accounts and service catalog...');
  try {
    execSync('npm run db:seed --workspace=@cshrk/api', { cwd: ROOT_DIR, stdio: 'inherit' });
    log('SEED', COLORS.green, 'Database seed completed successfully.');
  } catch (err) {
    log('SEED', COLORS.red, 'Database seed encountered an error.');
  }
}

// 4. Services Definition
const services = [
  {
    name: 'API',
    color: COLORS.cyan,
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'start:dev', '--workspace=@cshrk/api'],
    url: 'http://localhost:3000 (Swagger: http://localhost:3000/api/docs)',
  },
  {
    name: 'ADMIN',
    color: COLORS.green,
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev', '--workspace=@cshrk/admin-web'],
    url: 'http://localhost:5173',
  },
  {
    name: 'AI',
    color: COLORS.yellow,
    cmd: process.platform === 'win32' ? 'python' : 'python3',
    args: ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'],
    cwd: path.join(ROOT_DIR, 'services', 'ai'),
    url: 'http://localhost:8000 (Docs: http://localhost:8000/docs)',
  },
];

if (process.argv.includes('--customer')) {
  services.push({
    name: 'CUSTOMER-APP',
    color: COLORS.magenta,
    cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['expo', 'start'],
    cwd: path.join(ROOT_DIR, 'apps', 'customer-mobile'),
    url: 'Expo Dev Server (Customer App)',
  });
}

if (process.argv.includes('--worker')) {
  services.push({
    name: 'WORKER-APP',
    color: COLORS.blue,
    cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['expo', 'start'],
    cwd: path.join(ROOT_DIR, 'apps', 'worker-mobile'),
    url: 'Expo Dev Server (Worker App)',
  });
}

log('SYSTEM', COLORS.green, 'Starting core CSHRK application services concurrently...\n');
services.forEach((s) => {
  console.log(`  🚀 ${s.color}${COLORS.bold}${s.name.padEnd(8)}${COLORS.reset} -> ${s.url}`);
});
console.log('\n----------------------------------------------------------------\n');

const runningProcesses = [];

services.forEach((s) => {
  const child = spawn(s.cmd, s.args, {
    cwd: s.cwd || ROOT_DIR,
    env: { ...process.env, FORCE_COLOR: '1' },
    shell: true,
  });

  runningProcesses.push(child);

  const rlOut = readline.createInterface({ input: child.stdout });
  rlOut.on('line', (line) => {
    console.log(`${s.color}[${s.name}]${COLORS.reset} ${line}`);
  });

  const rlErr = readline.createInterface({ input: child.stderr });
  rlErr.on('line', (line) => {
    console.log(`${s.color}[${s.name} ERR]${COLORS.reset} ${line}`);
  });

  child.on('close', (code) => {
    log(s.name, s.color, `Process exited with code ${code}`);
  });
});

function cleanup() {
  console.log(`\n${COLORS.yellow}Shutting down CSHRK services...${COLORS.reset}`);
  runningProcesses.forEach((p) => {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', p.pid, '/f', '/t']);
      } else {
        p.kill('SIGINT');
      }
    } catch {
      // Ignore
    }
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
