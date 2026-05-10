import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const DEFAULT_CSRF_COOKIE_NAME = 'shopping_list_csrf';
const DEFAULT_CSRF_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 6;
const DEFAULT_RATE_LIMIT = 30;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const parsePositiveNumber = (value, fallback) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
};

const firstHeaderValue = (value) => {
  if (Array.isArray(value)) { return value[0]; }
  return typeof value === 'string' ? value : undefined;
};

const originFromHeader = (value) => {
  if (!value) { return undefined; }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};

export const createUnknownProductSecurity = ({
  allowedOrigins = '',
  csrfCookieMaxAgeSeconds = DEFAULT_CSRF_COOKIE_MAX_AGE_SECONDS,
  csrfCookieName = DEFAULT_CSRF_COOKIE_NAME,
  csrfSecret = randomBytes(32).toString('hex'),
  now = () => Date.now(),
  randomBytesSource = randomBytes,
  rateLimit = DEFAULT_RATE_LIMIT,
  rateLimitWindowMs = DEFAULT_RATE_LIMIT_WINDOW_MS,
} = {}) => {
  const requestBuckets = new Map();
  const trustedOrigins = new Set(
    String(allowedOrigins)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  const parsedRateLimit = parsePositiveNumber(rateLimit, DEFAULT_RATE_LIMIT);
  const parsedRateLimitWindowMs = parsePositiveNumber(rateLimitWindowMs, DEFAULT_RATE_LIMIT_WINDOW_MS);

  const signCsrfToken = (token, salt) => (
    createHmac('sha256', csrfSecret)
      .update(`${token}.${salt}`)
      .digest('base64url')
  );

  const createCsrfCookieValue = () => {
    const token = randomBytesSource(32).toString('base64url');
    const salt = randomBytesSource(16).toString('base64url');
    return `${token}.${salt}.${signCsrfToken(token, salt)}`;
  };

  const isValidCsrfCookieValue = (value) => {
    if (typeof value !== 'string') { return false; }

    const parts = value.split('.');
    if (parts.length !== 3) { return false; }

    const [token, salt, signature] = parts;
    if (!token || !salt || !signature) { return false; }

    const expectedSignature = signCsrfToken(token, salt);
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    return signatureBuffer.length === expectedSignatureBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
  };

  const parseCookies = (request) => {
    const cookieHeader = firstHeaderValue(request.headers.cookie);
    if (!cookieHeader) { return new Map(); }

    return new Map(cookieHeader.split(';').map((cookie) => {
      const separatorIndex = cookie.indexOf('=');
      if (separatorIndex === -1) {
        return [cookie.trim(), ''];
      }

      return [
        cookie.slice(0, separatorIndex).trim(),
        decodeURIComponent(cookie.slice(separatorIndex + 1).trim()),
      ];
    }));
  };

  const requestExpectedOrigin = (request) => {
    const host = firstHeaderValue(request.headers['x-forwarded-host']) ?? request.headers.host;
    if (!host) { return undefined; }

    const forwardedProto = firstHeaderValue(request.headers['x-forwarded-proto']);
    const proto = forwardedProto?.split(',')[0]?.trim() || (request.socket.encrypted ? 'https' : 'http');
    return `${proto}://${host}`;
  };

  const requestRemoteAddress = (request) => {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
      return forwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    return request.socket.remoteAddress ?? 'unknown';
  };

  const isSameOriginRequest = (request) => {
    const origin = originFromHeader(firstHeaderValue(request.headers.origin)) ??
      originFromHeader(firstHeaderValue(request.headers.referer));
    if (!origin) { return false; }

    const expectedOrigin = requestExpectedOrigin(request);
    return origin === expectedOrigin || trustedOrigins.has(origin);
  };

  const hasValidCsrfCookie = (request) => {
    const cookies = parseCookies(request);
    return isValidCsrfCookieValue(cookies.get(csrfCookieName));
  };

  const csrfCookieHeader = (request) => {
    const parts = [
      `${csrfCookieName}=${encodeURIComponent(createCsrfCookieValue())}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${csrfCookieMaxAgeSeconds}`,
    ];
    if (requestExpectedOrigin(request)?.startsWith('https://')) {
      parts.push('Secure');
    }
    return parts.join('; ');
  };

  const isRateLimited = (request) => {
    if (!Number.isFinite(parsedRateLimit) || parsedRateLimit <= 0) { return false; }

    const currentTime = now();
    const key = requestRemoteAddress(request);
    const bucket = requestBuckets.get(key) ?? { count: 0, resetAt: currentTime + parsedRateLimitWindowMs };
    if (currentTime >= bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = currentTime + parsedRateLimitWindowMs;
    }

    bucket.count += 1;
    requestBuckets.set(key, bucket);
    return bucket.count > parsedRateLimit;
  };

  return {
    createCsrfCookieValue,
    csrfCookieHeader,
    hasValidCsrfCookie,
    isRateLimited,
    isSameOriginRequest,
    isValidCsrfCookieValue,
    requestExpectedOrigin,
  };
};
