import { createConnection } from 'node:net';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const localDatabaseUrl = 'postgres://shopping_list:shopping_list@localhost:54321/shopping_list';
const envPath = '.env.local';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: npm run setup');
  console.log('Starts local Postgres with Docker Compose, writes .env.local, and creates the database schema.');
  process.exit(0);
}

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });

const capture = (command, args) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      shell: process.platform === 'win32',
    });
    let output = '';

    child.stdout?.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.stderr?.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.on('error', (error) => {
      resolve({ code: 1, output: error.message });
    });
    child.on('exit', (code) => {
      resolve({ code: code ?? 1, output });
    });
  });

const ensureDockerReady = async () => {
  const version = await capture('docker', ['--version']);
  if (version.code !== 0) {
    console.error('Docker is required for local Postgres setup, but the docker command is not available.');
    console.error('Install Docker Desktop, start it, then run `npm run setup` again.');
    process.exit(1);
  }

  const info = await capture('docker', ['info']);
  if (info.code !== 0) {
    console.error('Docker is installed, but the Docker daemon is not running.');
    console.error('Start Docker Desktop, wait until it says it is running, then run `npm run setup` again.');
    process.exit(1);
  }
};

const ensureEnvLocal = async () => {
  let current = '';
  try {
    current = await readFile(envPath, 'utf8');
  } catch (error) {
    if (error?.code !== 'ENOENT') { throw error; }
  }

  if (/^DATABASE_URL=/m.test(current) || /^SHOPPING_LIST_DATABASE_URL=/m.test(current)) {
    return;
  }

  const next = `${current}${current && !current.endsWith('\n') ? '\n' : ''}DATABASE_URL=${localDatabaseUrl}\n`;
  await writeFile(envPath, next, 'utf8');
  console.log(`Wrote ${envPath} with local DATABASE_URL.`);
};

const waitForPort = async ({ host, port, timeoutMs }) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const connected = await new Promise((resolve) => {
      const socket = createConnection({ host, port });
      socket.setTimeout(1_000);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        resolve(false);
      });
    });

    if (connected) { return; }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Postgres did not become reachable on ${host}:${port} within ${timeoutMs}ms.`);
};

const waitForSchema = async ({ initializeDatabase, closeDatabase, timeoutMs }) => {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      await initializeDatabase();
      await closeDatabase();
      return;
    } catch (error) {
      lastError = error;
      await closeDatabase().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }

  throw lastError ?? new Error(`Postgres schema was not ready within ${timeoutMs}ms.`);
};

try {
  await ensureDockerReady();
  await run('docker', ['compose', 'up', '-d', 'postgres']);
  await waitForPort({ host: '127.0.0.1', port: 54321, timeoutMs: 60_000 });
  await ensureEnvLocal();

  process.env.DATABASE_URL = process.env.DATABASE_URL ?? localDatabaseUrl;
  const { closeDatabase, initializeDatabase } = await import('../server/database.mjs');
  await waitForSchema({ initializeDatabase, closeDatabase, timeoutMs: 60_000 });

  console.log('Postgres is running and the shopping-list schema is ready.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
