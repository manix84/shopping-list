import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const parseEnvLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) { return undefined; }

  const equalsIndex = trimmed.indexOf('=');
  if (equalsIndex === -1) { return undefined; }

  const key = trimmed.slice(0, equalsIndex).trim();
  let value = trimmed.slice(equalsIndex + 1).trim();
  if (!key) { return undefined; }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
};

const loadEnvFile = (path) => {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') { return; }
    throw error;
  }

  for (const line of raw.split(/\r?\n/)) {
    const entry = parseEnvLine(line);
    if (!entry || process.env[entry.key] !== undefined) { continue; }
    process.env[entry.key] = entry.value;
  }
};

loadEnvFile(resolve('.env'));
loadEnvFile(resolve('.env.local'));
