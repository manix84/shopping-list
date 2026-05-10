import { COUNTRY_CODES } from './constants.mjs';

const LOCALE_CODES = new Set(['en', 'es', 'fr', 'de', 'nl', 'it', 'ro', 'pi']);
const DEFAULT_ISSUE_TITLE = 'Unknown products';
const PRODUCT_TITLE_VALUE_MAX_LENGTH = 120;
const githubToken = process.env.FOOD_GITHUB_TOKEN ?? process.env.UNKNOWN_PRODUCTS_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const githubRepo = process.env.FOOD_GITHUB_REPO ?? process.env.UNKNOWN_PRODUCTS_GITHUB_REPO ?? process.env.GITHUB_REPOSITORY;
const githubParentIssueNumber = process.env.FOOD_GITHUB_ISSUE ?? process.env.UNKNOWN_PRODUCTS_GITHUB_ISSUE_NUMBER;
const githubParentIssueTitle = process.env.FOOD_GITHUB_TITLE ?? process.env.UNKNOWN_PRODUCTS_GITHUB_ISSUE_TITLE ?? DEFAULT_ISSUE_TITLE;

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
  'X-GitHub-Api-Version': '2026-03-10',
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
    const message = await response.text().catch(() => '');
    throw new Error(`GitHub request failed: ${response.status}${message ? ` ${message}` : ''}`);
  }

  return response.status === 204 ? undefined : response.json();
};

const findUnknownProductsParentIssue = async () => {
  if (githubParentIssueNumber) {
    const issueNumber = Number(githubParentIssueNumber);
    if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
      throw new Error('FOOD_GITHUB_ISSUE must be a positive issue number');
    }
    return issueNumber;
  }

  const query = new URLSearchParams({
    q: `repo:${githubRepo} is:issue is:open in:title ${JSON.stringify(githubParentIssueTitle)}`,
  });
  const result = await githubFetch(`/search/issues?${query.toString()}`);
  const existingIssue = Array.isArray(result?.items)
    ? result.items.find((issue) => issue.title === githubParentIssueTitle && typeof issue.number === 'number')
    : undefined;
  if (existingIssue) { return existingIssue.number; }

  const createdIssue = await githubFetch(`/repos/${githubRepo}/issues`, {
    method: 'POST',
    body: JSON.stringify({
      title: githubParentIssueTitle,
      body: 'Parent issue for automatically collected shopping-list products that did not match a known store section.',
    }),
  });

  if (typeof createdIssue?.number !== 'number') {
    throw new Error('GitHub returned an invalid parent issue payload');
  }

  return createdIssue.number;
};

const escapeMarkdownCell = (value) => String(value ?? '')
  .replaceAll('\\', '\\\\')
  .replaceAll('|', '\\|')
  .replaceAll('\n', ' ')
  .trim();

const escapeInlineCode = (value) => String(value ?? '')
  .replaceAll('`', "'")
  .replaceAll('\n', ' ')
  .trim();

const truncateTitleValue = (value) => {
  if (value.length <= PRODUCT_TITLE_VALUE_MAX_LENGTH) { return value; }
  return `${value.slice(0, PRODUCT_TITLE_VALUE_MAX_LENGTH - 1).trimEnd()}…`;
};

const productIssueTitle = (item) => `[PRODUCT] \`${truncateTitleValue(escapeInlineCode(item.raw))}\` filed under \`other\``;

const unknownProductDetails = (item, report) => {
  const reportedAt = new Date().toISOString();

  return [
    'Automatically collected shopping-list products that did not match a known store section.',
    '',
    '| Item | Normalized | Country | Locale | Reported at |',
    '| --- | --- | --- | --- | --- |',
    `| ${[
      escapeMarkdownCell(item.raw),
      escapeMarkdownCell(item.normalized ?? item.cleaned ?? ''),
      report.countryCode,
      report.locale,
      reportedAt,
    ].join(' | ')} |`,
  ].join('\n');
};

const unknownProductDuplicateComment = (item, report) => [
  '+1',
  '',
  unknownProductDetails(item, report),
].join('\n');

const findIssueByTitle = async (title) => {
  const query = new URLSearchParams({
    q: `repo:${githubRepo} is:issue is:open in:title ${JSON.stringify(title)}`,
  });
  const result = await githubFetch(`/search/issues?${query.toString()}`);
  return Array.isArray(result?.items)
    ? result.items.find((issue) => issue.title === title && typeof issue.id === 'number' && typeof issue.number === 'number')
    : undefined;
};

const createUnknownProductIssue = async (item, report) => {
  const createdIssue = await githubFetch(`/repos/${githubRepo}/issues`, {
    method: 'POST',
    body: JSON.stringify({
      title: productIssueTitle(item),
      body: unknownProductDetails(item, report),
    }),
  });

  if (typeof createdIssue?.id !== 'number' || typeof createdIssue?.number !== 'number') {
    throw new Error('GitHub returned an invalid issue payload');
  }

  return createdIssue;
};

const commentOnIssue = async (issueNumber, body) => {
  await githubFetch(`/repos/${githubRepo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
};

const addSubIssue = async (parentIssueNumber, subIssueId) => {
  await githubFetch(`/repos/${githubRepo}/issues/${parentIssueNumber}/sub_issues`, {
    method: 'POST',
    body: JSON.stringify({ sub_issue_id: subIssueId }),
  });
};

const tryAddSubIssue = async (parentIssueNumber, subIssueId) => {
  try {
    await addSubIssue(parentIssueNumber, subIssueId);
  } catch (error) {
    // Existing sub-issue relationships can return validation errors; duplicate reports
    // should still be logged as comments on the product issue.
    if (!String(error?.message ?? '').includes('422')) {
      throw error;
    }
  }
};

export const submitUnknownProductsReport = async (report) => {
  if (!githubToken || !githubRepo) {
    return { ok: false, disabled: true };
  }

  const parentIssueNumber = await findUnknownProductsParentIssue();
  const issues = [];

  for (const item of report.items) {
    const existingIssue = await findIssueByTitle(productIssueTitle(item));
    if (existingIssue) {
      await commentOnIssue(existingIssue.number, unknownProductDuplicateComment(item, report));
      await tryAddSubIssue(parentIssueNumber, existingIssue.id);
      issues.push({ number: existingIssue.number, duplicate: true });
      continue;
    }

    const subIssue = await createUnknownProductIssue(item, report);
    await addSubIssue(parentIssueNumber, subIssue.id);
    issues.push({ number: subIssue.number, duplicate: false });
  }

  return { ok: true, issues, parentIssueNumber };
};
