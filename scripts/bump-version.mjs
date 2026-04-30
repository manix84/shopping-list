#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const releaseType = process.argv[2] ?? 'auto';
const explicitReleaseTypes = new Set(['major', 'minor', 'patch']);

const runGit = (args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

const latestVersionTag = () => runGit(['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*']);

const commitsSinceLatestVersion = () => {
  const tag = latestVersionTag();
  const range = tag ? `${tag}..HEAD` : 'HEAD';

  return runGit(['log', '--format=%B%n---COMMIT-END---', range]);
};

const inferReleaseType = () => {
  const commits = commitsSinceLatestVersion();

  if (/BREAKING CHANGE:/m.test(commits) || /^[a-z]+(?:\([^)]+\))?!:/m.test(commits)) {
    return 'major';
  }

  if (/^feat(?:\([^)]+\))?:/m.test(commits)) {
    return 'minor';
  }

  return 'patch';
};

const nextReleaseType = releaseType === 'auto' ? inferReleaseType() : releaseType;

if (!explicitReleaseTypes.has(nextReleaseType)) {
  console.error('Usage: node scripts/bump-version.mjs [auto|major|minor|patch]');
  process.exit(1);
}

console.log(`Bumping ${nextReleaseType} version...`);
execFileSync('npm', ['version', nextReleaseType, '--no-git-tag-version'], { stdio: 'inherit' });
