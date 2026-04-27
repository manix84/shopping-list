import { existsSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import os from 'node:os';
import { preview } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = resolve(root, 'lighthouse');
const reportJson = resolve(reportDir, 'report.json');
const reportHtml = resolve(reportDir, 'report.html');
const defaultUrl = 'http://127.0.0.1:4173/';

const thresholds = {
  performance: Number(process.env.LIGHTHOUSE_PERFORMANCE_MIN ?? 0.9),
  accessibility: Number(process.env.LIGHTHOUSE_ACCESSIBILITY_MIN ?? 0.95),
  'best-practices': Number(process.env.LIGHTHOUSE_BEST_PRACTICES_MIN ?? 0.95),
  seo: Number(process.env.LIGHTHOUSE_SEO_MIN ?? 0.95),
};

const lighthouseBin = resolve(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'lighthouse.cmd' : 'lighthouse',
);

const run = (command, args) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', rejectRun);
    child.on('exit', (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }

      rejectRun(new Error(`${command} exited with code ${code ?? 'unknown'}`));
    });
  });

const runLighthouse = async (url, output, outputPath) => {
  await run(lighthouseBin, [
    url,
    '--quiet',
    `--output=${output}`,
    `--output-path=${outputPath}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless=new --no-sandbox',
  ]);
};

const readScores = async () => {
  const report = JSON.parse(await readFile(reportJson, 'utf8'));
  return Object.fromEntries(
    Object.entries(report.categories).map(([key, category]) => [key, category.score]),
  );
};

const formatScore = (score) => `${Math.round(score * 100)}`;

const main = async () => {
  if (process.platform === 'darwin' && process.arch === 'x64' && os.cpus()[0]?.model.includes('Apple')) {
    throw new Error(
      'Lighthouse cannot launch Chrome from x64 Node on Apple Silicon. Run this with an arm64 Node install, for example: `arch -arm64 npm run lighthouse`.',
    );
  }

  if (!existsSync(lighthouseBin)) {
    throw new Error('Lighthouse is not installed. Run `npm install` to install dev dependencies.');
  }

  await rm(reportDir, { force: true, recursive: true });
  await mkdir(reportDir, { recursive: true });

  const externalUrl = process.env.LIGHTHOUSE_URL;
  const url = externalUrl ?? defaultUrl;
  const server = externalUrl
    ? undefined
    : await preview({
        root,
        preview: {
          host: '127.0.0.1',
          port: 4173,
          strictPort: true,
        },
      });

  try {
    await runLighthouse(url, 'json', reportJson);
    await runLighthouse(url, 'html', reportHtml);

    const scores = await readScores();
    const failures = Object.entries(thresholds).filter(([category, threshold]) => {
      const score = scores[category];
      return typeof score !== 'number' || score < threshold;
    });

    console.log('\nLighthouse scores');
    for (const [category, score] of Object.entries(scores)) {
      console.log(`- ${category}: ${formatScore(score)}`);
    }
    console.log(`\nReports written to ${reportDir}`);

    if (failures.length > 0) {
      console.error('\nLighthouse thresholds failed');
      for (const [category, threshold] of failures) {
        const actual = scores[category];
        console.error(`- ${category}: ${actual == null ? 'missing' : formatScore(actual)} < ${formatScore(threshold)}`);
      }
      process.exitCode = 1;
    }
  } finally {
    await new Promise((resolveClose) => {
      if (!server) {
        resolveClose();
        return;
      }

      server.httpServer.close(() => resolveClose());
    });
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
