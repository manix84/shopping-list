import { COUNTRY_CODES } from './constants.mjs';

const LOCALE_CODES = new Set(['en', 'es', 'fr', 'de', 'nl', 'it', 'ro', 'pi']);
const DEFAULT_ISSUE_TITLE = 'Unknown products';
const githubToken = process.env.UNKNOWN_PRODUCTS_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const githubRepo = process.env.UNKNOWN_PRODUCTS_GITHUB_REPO ?? process.env.GITHUB_REPOSITORY;
const githubIssueNumber = process.env.UNKNOWN_PRODUCTS_GITHUB_ISSUE_NUMBER;
const githubIssueTitle = process.env.UNKNOWN_PRODUCTS_GITHUB_ISSUE_TITLE ?? DEFAULT_ISSUE_TITLE;

const isReportItem = (value) =>
  value &&
  typeof value === 'object' &&
  typeof value.raw === 'string' &&
  value.raw.trim().length > 0 &&
  (value.normalized === undefined || typeof value.normalized === 'string') &&
  (value.cleaned === undefined || typeof value.cleaned === 'string');

export const isUnknownProductsReport = (value) =>
  value &&
  typeof value === 'object' &&
  COUNTRY_CODES.has(value.countryCode) &&
  LOCALE_CODES.has(value.locale) &&
  Array.isArray(value.items) &&
  value.items.length > 0 &&
  value.items.length <= 20 &&
  value.items.every(isReportItem);

const githubHeaders = () => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${githubToken}`,
  'Content-Type': 'application/json',
  'User-Agent': 'smart-shopping-list',
  'X-GitHub-Api-Version': '2022-11-28',
});

const githubFetch = async (path, init = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      ...githubHeaders(),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }

  return response.status === 204 ? undefined : response.json();
};

const findUnknownProductsIssue = async () => {
  if (githubIssueNumber) { return Number(githubIssueNumber); }

  const query = new URLSearchParams({
    q: `repo:${githubRepo} is:issue is:open in:title ${JSON.stringify(githubIssueTitle)}`,
  });
  const result = await githubFetch(`/search/issues?${query.toString()}`);
  const existingIssue = Array.isArray(result?.items)
    ? result.items.find((issue) => issue.title === githubIssueTitle && typeof issue.number === 'number')
    : undefined;
  if (existingIssue) { return existingIssue.number; }

  const createdIssue = await githubFetch(`/repos/${githubRepo}/issues`, {
    method: 'POST',
    body: JSON.stringify({
      title: githubIssueTitle,
      body: 'Automatically collected shopping-list products that did not match a known store section.',
    }),
  });

  return createdIssue.number;
};

const escapeMarkdownCell = (value) => String(value ?? '')
  .replaceAll('\\', '\\\\')
  .replaceAll('|', '\\|')
  .replaceAll('\n', ' ')
  .trim();

const unknownProductsComment = (report) => {
  const reportedAt = new Date().toISOString();
  const rows = report.items.map((item) => [
    escapeMarkdownCell(item.raw),
    escapeMarkdownCell(item.normalized ?? item.cleaned ?? ''),
    report.countryCode,
    report.locale,
    reportedAt,
  ]);

  return [
    '### Unknown product report',
    '',
    '| Item | Normalized | Country | Locale | Reported at |',
    '| --- | --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
};

export const submitUnknownProductsReport = async (report) => {
  if (!githubToken || !githubRepo) {
    return { ok: false, disabled: true };
  }

  const issueNumber = await findUnknownProductsIssue();
  await githubFetch(`/repos/${githubRepo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: unknownProductsComment(report) }),
  });

  return { ok: true, issueNumber };
};
