#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const releaseType = process.argv[2] ?? 'auto';
const explicitReleaseTypes = new Set(['major', 'minor', 'patch']);
const automaticReleaseTypes = new Set(['auto', 'prepush']);
const versionTagPattern = /^v(\d+\.\d+\.\d+)$/;

const runGit = (args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

const latestVersionTag = () => runGit(['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*']);

const packageVersion = () => JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const compareVersions = (left, right) => {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1;
    if (leftParts[index] < rightParts[index]) return -1;
  }

  return 0;
};

const latestTaggedVersion = () => {
  const tag = latestVersionTag();
  const match = tag.match(versionTagPattern);
  return match?.[1];
};

const upstreamRef = () => runGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']);

const defaultBaseRef = () => {
  const originHead = runGit(['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD']);
  if (originHead) return originHead;
  if (runGit(['rev-parse', '--verify', 'origin/main'])) return 'origin/main';
  if (runGit(['rev-parse', '--verify', 'origin/master'])) return 'origin/master';
  return undefined;
};

const packageVersionAtRef = (ref) => {
  if (!ref) return undefined;

  try {
    return JSON.parse(execFileSync('git', ['show', `${ref}:package.json`], { encoding: 'utf8' })).version;
  } catch {
    return undefined;
  }
};

const commitsSinceLatestVersion = (baseRef) => {
  if (baseRef) {
    return runGit(['log', '--format=%B%n---COMMIT-END---', `${baseRef}..HEAD`]);
  }

  const tag = latestVersionTag();
  const range = tag ? `${tag}..HEAD` : 'HEAD';

  return runGit(['log', '--format=%B%n---COMMIT-END---', range]);
};

const inferReleaseType = (baseRef) => {
  const commits = commitsSinceLatestVersion(baseRef);

  if (/BREAKING CHANGE:/m.test(commits) || /^[a-z]+(?:\([^)]+\))?!:/m.test(commits)) {
    return 'major';
  }

  if (/^feat(?:\([^)]+\))?:/m.test(commits)) {
    return 'minor';
  }

  return 'patch';
};

const prepushBaseRef = releaseType === 'prepush' ? upstreamRef() || defaultBaseRef() : undefined;
const nextReleaseType = automaticReleaseTypes.has(releaseType) ? inferReleaseType(prepushBaseRef) : releaseType;

if (!explicitReleaseTypes.has(nextReleaseType)) {
  console.error('Usage: node scripts/bump-version.mjs [auto|major|minor|patch]');
  process.exit(1);
}

const taggedVersion = latestTaggedVersion();
if (automaticReleaseTypes.has(releaseType)) {
  const currentVersion = packageVersion();
  const upstreamVersion = packageVersionAtRef(prepushBaseRef);

  if (upstreamVersion && compareVersions(currentVersion, upstreamVersion) > 0) {
    console.log(`Version ${currentVersion} is already ahead of upstream ${upstreamVersion}.`);
    process.exit(0);
  }

  if (taggedVersion && compareVersions(currentVersion, taggedVersion) > 0) {
    console.log(`Version ${currentVersion} is already ahead of latest tag v${taggedVersion}.`);
    process.exit(0);
  }

  if (releaseType === 'prepush' && !prepushBaseRef && !taggedVersion) {
    console.log('No upstream, default branch, or version tag found; skipping automatic pre-push version bump.');
    process.exit(0);
  }
}

console.log(`Bumping ${nextReleaseType} version...`);
execFileSync('npm', ['version', nextReleaseType, '--no-git-tag-version'], { stdio: 'inherit' });
