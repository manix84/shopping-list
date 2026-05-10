import { createReadStream, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import {
  clearSharedList,
  createSharedList,
  getDatabaseStatus,
  getSharedList,
  isSharedListId,
  saveSharedList,
} from './database.mjs';
import { callShoppingListService, getHomeAssistantStatus, pushRecordToHomeAssistant } from './homeAssistant.mjs';
import { isUnknownProductsReport, submitUnknownProductsReport } from './unknownProducts.mjs';
import { isShoppingListRecord } from './validation.mjs';

const port = Number(process.env.PORT ?? 8787);
const distDir = resolve('dist');
const appVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const homeAssistantIntegrationEnabled = process.env.ENABLE_HOME_ASSISTANT_INTEGRATION === 'true';
const clacksOverhead = 'GNU Terry Pratchett';
const parsePositiveNumber = (value, fallback) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
};
const unknownProductsRateLimit = parsePositiveNumber(process.env.FOOD_REPORT_RATE_LIMIT, 30);
const unknownProductsRateLimitWindowMs = parsePositiveNumber(process.env.FOOD_REPORT_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const trustedUnknownProductReportOrigins = new Set(
  String(process.env.FOOD_REPORT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const sharedListEventClients = new Map();
const unknownProductsRequestBuckets = new Map();

const requestRemoteAddress = (request) => {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.socket.remoteAddress ?? 'unknown';
};

const isUnknownProductsRateLimited = (request) => {
  if (!Number.isFinite(unknownProductsRateLimit) || unknownProductsRateLimit <= 0) { return false; }

  const now = Date.now();
  const key = requestRemoteAddress(request);
  const bucket = unknownProductsRequestBuckets.get(key) ?? { count: 0, resetAt: now + unknownProductsRateLimitWindowMs };
  if (now >= bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + unknownProductsRateLimitWindowMs;
  }

  bucket.count += 1;
  unknownProductsRequestBuckets.set(key, bucket);
  return bucket.count > unknownProductsRateLimit;
};

const firstHeaderValue = (value) => {
  if (Array.isArray(value)) { return value[0]; }
  return typeof value === 'string' ? value : undefined;
};

const requestExpectedOrigin = (request) => {
  const host = firstHeaderValue(request.headers['x-forwarded-host']) ?? request.headers.host;
  if (!host) { return undefined; }

  const forwardedProto = firstHeaderValue(request.headers['x-forwarded-proto']);
  const proto = forwardedProto?.split(',')[0]?.trim() || (request.socket.encrypted ? 'https' : 'http');
  return `${proto}://${host}`;
};

const originFromHeader = (value) => {
  if (!value) { return undefined; }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};

const isSameOriginUnknownProductsRequest = (request) => {
  const origin = originFromHeader(firstHeaderValue(request.headers.origin)) ??
    originFromHeader(firstHeaderValue(request.headers.referer));
  if (!origin) { return false; }

  const expectedOrigin = requestExpectedOrigin(request);
  return origin === expectedOrigin || trustedUnknownProductReportOrigins.has(origin);
};

const sendSharedListEvent = (response, event) => {
  if (response.destroyed || response.writableEnded) { return false; }

  try {
    response.write(`event: ${event.type}\n`);
    response.write(`data: ${JSON.stringify(event)}\n\n`);
    return true;
  } catch {
    return false;
  }
};

const sendSharedListComment = (response, comment) => {
  if (response.destroyed || response.writableEnded) { return false; }

  try {
    response.write(`: ${comment}\n\n`);
    return true;
  } catch {
    return false;
  }
};

const addSharedListEventClient = (request, response, listId) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'X-Clacks-Overhead': clacksOverhead,
  });
  response.write('retry: 5000\n\n');
  if (!sendSharedListEvent(response, { type: 'connected', listId, updatedAt: new Date().toISOString() })) {
    response.end();
    return;
  }

  const clients = sharedListEventClients.get(listId) ?? new Set();
  clients.add(response);
  sharedListEventClients.set(listId, clients);

  const keepAlive = setInterval(() => {
    if (!sendSharedListComment(response, 'keep-alive')) {
      clearInterval(keepAlive);
      clients.delete(response);
      if (clients.size === 0) {
        sharedListEventClients.delete(listId);
      }
      response.end();
    }
  }, 25_000);

  request.on('close', () => {
    clearInterval(keepAlive);
    clients.delete(response);
    if (clients.size === 0) {
      sharedListEventClients.delete(listId);
    }
    response.end();
  });
};

const publishSharedListEvent = (listId, event) => {
  const clients = sharedListEventClients.get(listId);
  if (!clients) { return; }

  for (const client of clients) {
    if (!sendSharedListEvent(client, { ...event, listId })) {
      clients.delete(client);
    }
  }

  if (clients.size === 0) {
    sharedListEventClients.delete(listId);
  }
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Clacks-Overhead': clacksOverhead,
  });
  response.end(JSON.stringify(payload));
};

const errorMessage = (error) => {
  if (error instanceof Error && error.message) { return error.message; }
  if (Array.isArray(error?.errors)) {
    for (const nestedError of error.errors) {
      const nestedMessage = errorMessage(nestedError);
      if (nestedMessage) { return nestedMessage; }
    }
  }
  if (typeof error?.code === 'string' && error.code) { return error.code; }
  return 'Unexpected server error';
};

const readJsonBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) { return {}; }

  try {
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const invalidJsonError = new Error('Invalid JSON body');
      invalidJsonError.statusCode = 400;
      throw invalidJsonError;
    }

    throw error;
  }
};

const sendError = (response, error) => {
  const statusCode = error?.statusCode ?? 500;
  sendJson(response, statusCode, {
    error: errorMessage(error),
  });
};

const handleApi = async (request, response, path) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === 'GET' && path === '/api/health') {
    sendJson(response, 200, { ok: true, mode: 'backend', version: appVersion, database: await getDatabaseStatus() });
    return;
  }

  if (request.method === 'GET' && path === '/api/database/status') {
    sendJson(response, 200, await getDatabaseStatus());
    return;
  }

  if (request.method === 'POST' && path === '/api/unknown-products') {
    if (!isSameOriginUnknownProductsRequest(request)) {
      sendJson(response, 403, { error: 'Unknown product reports must come from the app origin' });
      return;
    }

    if (isUnknownProductsRateLimited(request)) {
      sendJson(response, 429, { error: 'Too many unknown product reports' });
      return;
    }

    const body = await readJsonBody(request);
    if (!isUnknownProductsReport(body)) {
      sendJson(response, 400, { error: 'A valid unknown products report is required' });
      return;
    }

    const result = await submitUnknownProductsReport(body);
    if (result.disabled) {
      sendJson(response, 200, { disabled: true });
      return;
    }

    sendJson(response, 200, result);
    return;
  }

  if (request.method === 'POST' && path === '/api/shared-lists') {
    const body = await readJsonBody(request);
    if (!isShoppingListRecord(body.record)) {
      sendJson(response, 400, { error: 'A valid record is required to create a shared list' });
      return;
    }

    sendJson(response, 201, await createSharedList(body.record));
    return;
  }

  const sharedListEventsMatch = path.match(/^\/api\/shared-lists\/([^/]+)\/events$/);
  if (sharedListEventsMatch) {
    const id = sharedListEventsMatch[1];
    if (!isSharedListId(id)) {
      sendJson(response, 400, { error: 'Invalid shared list id' });
      return;
    }

    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    addSharedListEventClient(request, response, id);
    return;
  }

  const sharedListMatch = path.match(/^\/api\/shared-lists\/([^/]+)$/);
  if (sharedListMatch) {
    const id = sharedListMatch[1];
    if (!isSharedListId(id)) {
      sendJson(response, 400, { error: 'Invalid shared list id' });
      return;
    }

    if (request.method === 'GET') {
      sendJson(response, 200, await getSharedList(id));
      return;
    }

    if (request.method === 'PUT') {
      const record = await readJsonBody(request);
      if (!isShoppingListRecord(record, id)) {
        sendJson(response, 400, { error: 'Invalid shopping list record' });
        return;
      }

      const payload = await saveSharedList(id, record);
      publishSharedListEvent(id, { type: 'updated', updatedAt: payload.updatedAt ?? payload.record.updatedAt });
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === 'DELETE') {
      const payload = await clearSharedList(id);
      publishSharedListEvent(id, { type: 'deleted', updatedAt: new Date().toISOString() });
      sendJson(response, 200, payload);
      return;
    }
  }

  if (path.startsWith('/api/home-assistant/')) {
    if (!homeAssistantIntegrationEnabled) {
      sendJson(response, 404, { error: 'Home Assistant integration is disabled' });
      return;
    }

    if (request.method === 'GET' && path === '/api/home-assistant/status') {
      sendJson(response, 200, getHomeAssistantStatus());
      return;
    }

    if (request.method === 'POST' && path === '/api/home-assistant/sync') {
      const body = await readJsonBody(request);
      const listId = typeof body.listId === 'string' ? body.listId : undefined;
      const sharedListPayload =
        !isShoppingListRecord(body.record) && isSharedListId(listId)
          ? await getSharedList(listId)
          : undefined;
      const record = isShoppingListRecord(body.record)
        ? body.record
        : sharedListPayload?.exists && isShoppingListRecord(sharedListPayload.record)
          ? sharedListPayload.record
          : undefined;
      if (!record) {
        sendJson(response, 400, { error: 'A valid record or shared list id is required to sync Home Assistant' });
        return;
      }

      const actions = await pushRecordToHomeAssistant(record);
      sendJson(response, 200, { ok: true, actions });
      return;
    }

    const serviceMatch = path.match(/^\/api\/home-assistant\/(add-item|remove-item|complete-item|incomplete-item)$/);
    if (request.method === 'POST' && serviceMatch) {
      const body = await readJsonBody(request);
      if (typeof body.name !== 'string' || !body.name.trim()) {
        sendJson(response, 400, { error: 'A non-empty item name is required' });
        return;
      }

      const service = serviceMatch[1].replaceAll('-', '_');
      const result = await callShoppingListService(service, { name: body.name.trim() });
      sendJson(response, 200, { ok: true, result });
      return;
    }

    if (request.method === 'POST' && path === '/api/home-assistant/sort') {
      const result = await callShoppingListService('sort');
      sendJson(response, 200, { ok: true, result });
      return;
    }
  }

  sendJson(response, 404, { error: 'API route not found' });
};

const serveStatic = async (request, response, pathname) => {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = resolve(join(distDir, requestedPath));

  if (!filePath.startsWith(distDir)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
      'X-Clacks-Overhead': clacksOverhead,
    });
    createReadStream(filePath).pipe(response);
  } catch {
    const indexPath = join(distDir, 'index.html');
    response.writeHead(200, {
      'Content-Type': contentTypes['.html'],
      'X-Clacks-Overhead': clacksOverhead,
    });
    createReadStream(indexPath).pipe(response);
  }
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  void (async () => {
    try {
      if (url.pathname.startsWith('/api/')) {
        await handleApi(request, response, url.pathname);
        return;
      }

      await serveStatic(request, response, url.pathname);
    } catch (error) {
      sendError(response, error);
    }
  })();
});

server.listen(port, () => {
  console.log(`Shopping list backend listening on http://localhost:${port}`);
});
