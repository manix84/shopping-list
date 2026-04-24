import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import {
  clearSharedList,
  clearShoppingList,
  createSharedList,
  getDatabaseStatus,
  getSharedList,
  getShoppingList,
  isSharedListId,
  saveSharedList,
  saveShoppingList,
} from './database.mjs';
import { callShoppingListService, getHomeAssistantStatus, pushRecordToHomeAssistant } from './homeAssistant.mjs';

const port = Number(process.env.PORT ?? 8787);
const distDir = resolve('dist');

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

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
};

const readJsonBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};

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
    error: error instanceof Error ? error.message : 'Unexpected server error',
  });
};

const isShoppingListRecord = (value) =>
  value &&
  typeof value === 'object' &&
  typeof value.input === 'string' &&
  Array.isArray(value.items) &&
  typeof value.updatedAt === 'string' &&
  typeof value.countryCode === 'string';

const handleApi = async (request, response, path) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === 'GET' && path === '/api/health') {
    sendJson(response, 200, { ok: true, mode: 'backend' });
    return;
  }

  if (request.method === 'GET' && path === '/api/database/status') {
    sendJson(response, 200, await getDatabaseStatus());
    return;
  }

  if (request.method === 'GET' && path === '/api/shopping-list') {
    sendJson(response, 200, await getShoppingList());
    return;
  }

  if (request.method === 'PUT' && path === '/api/shopping-list') {
    const record = await readJsonBody(request);
    if (!isShoppingListRecord(record)) {
      sendJson(response, 400, { error: 'Invalid shopping list record' });
      return;
    }

    sendJson(response, 200, await saveShoppingList(record));
    return;
  }

  if (request.method === 'DELETE' && path === '/api/shopping-list') {
    sendJson(response, 200, await clearShoppingList());
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
      if (!isShoppingListRecord(record)) {
        sendJson(response, 400, { error: 'Invalid shopping list record' });
        return;
      }

      sendJson(response, 200, await saveSharedList(id, record));
      return;
    }

    if (request.method === 'DELETE') {
      sendJson(response, 200, await clearSharedList(id));
      return;
    }
  }

  if (request.method === 'GET' && path === '/api/home-assistant/status') {
    sendJson(response, 200, getHomeAssistantStatus());
    return;
  }

  if (request.method === 'POST' && path === '/api/home-assistant/sync') {
    const body = await readJsonBody(request);
    const record = isShoppingListRecord(body.record) ? body.record : (await getShoppingList()).record;
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
    });
    createReadStream(filePath).pipe(response);
  } catch {
    const indexPath = join(distDir, 'index.html');
    response.writeHead(200, { 'Content-Type': contentTypes['.html'] });
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
