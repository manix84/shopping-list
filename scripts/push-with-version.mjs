#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const pushArgs = process.argv.slice(2);
const packageFiles = ['package.json', 'package-lock.json'];

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    stdio: options.capture ? ['ignore', 'pipe', 'ignore'] : 'inherit',
    encoding: options.capture ? 'utf8' : undefined,
  });

const packageDiff = (cached = false) =>
  run('git', ['diff', cached ? '--cached' : '--', ...(!cached ? packageFiles : ['--', ...packageFiles])], {
    capture: true,
  }).trim();

const hasPackageChanges = () => packageDiff(false).length > 0 || packageDiff(true).length > 0;

const currentVersion = () => JSON.parse(run('git', ['show', 'HEAD:package.json'], { capture: true })).version;

const workingVersion = () => JSON.parse(run('node', ['-p', 'JSON.stringify(require("./package.json").version)'], { capture: true }));

const commitVersionFiles = () => {
  run('git', ['add', ...packageFiles]);
  run('git', ['commit', '-m', `chore: bump app version to ${workingVersion()}`]);
};

if (hasPackageChanges()) {
  console.error('package.json or package-lock.json already has uncommitted changes.');
  console.error('Commit or stash those changes before running npm run push.');
  process.exit(1);
}

run('npm', ['run', 'version:prepush']);

if (hasPackageChanges()) {
  commitVersionFiles();
} else {
  console.log(`Version ${currentVersion()} is already current for this push.`);
}

run('git', ['push', '--no-verify', ...pushArgs]);
