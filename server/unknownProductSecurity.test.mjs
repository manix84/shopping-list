import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { createUnknownProductSecurity } from './unknownProductSecurity.mjs';

const request = ({ headers = {}, encrypted = false, remoteAddress = '127.0.0.1' } = {}) => ({
  headers,
  socket: {
    encrypted,
    remoteAddress,
  },
});

const cookieValueFromHeader = (header) => {
  const [cookiePair] = header.split(';');
  return decodeURIComponent(cookiePair.slice(cookiePair.indexOf('=') + 1));
};

const cookieHeaderFromValue = (value) => `shopping_list_csrf=${encodeURIComponent(value)}`;

describe('unknown product security', () => {
  it('creates a salted signed CSRF cookie value', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });
    const value = security.createCsrfCookieValue();
    const parts = value.split('.');

    expect(parts).toHaveLength(3);
    expect(parts[0]).not.toHaveLength(0);
    expect(parts[1]).not.toHaveLength(0);
    expect(parts[2]).not.toHaveLength(0);
    expect(security.isValidCsrfCookieValue(value)).toBe(true);
  });

  it('creates unique CSRF cookie values', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });

    expect(security.createCsrfCookieValue()).not.toBe(security.createCsrfCookieValue());
  });

  it('rejects malformed CSRF cookie values', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });

    expect(security.isValidCsrfCookieValue(undefined)).toBe(false);
    expect(security.isValidCsrfCookieValue('')).toBe(false);
    expect(security.isValidCsrfCookieValue('token.signature')).toBe(false);
    expect(security.isValidCsrfCookieValue('token.salt.signature.extra')).toBe(false);
    expect(security.isValidCsrfCookieValue('token..signature')).toBe(false);
  });

  it('rejects CSRF cookies signed with a different secret', () => {
    const trustedSecurity = createUnknownProductSecurity({ csrfSecret: 'trusted-secret' });
    const attackerSecurity = createUnknownProductSecurity({ csrfSecret: 'attacker-secret' });

    expect(trustedSecurity.isValidCsrfCookieValue(attackerSecurity.createCsrfCookieValue())).toBe(false);
  });

  it('rejects tampered CSRF token, salt, and signature values', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });
    const [token, salt, signature] = security.createCsrfCookieValue().split('.');

    expect(security.isValidCsrfCookieValue(`tampered-${token}.${salt}.${signature}`)).toBe(false);
    expect(security.isValidCsrfCookieValue(`${token}.tampered-${salt}.${signature}`)).toBe(false);
    expect(security.isValidCsrfCookieValue(`${token}.${salt}.tampered-${signature}`)).toBe(false);
  });

  it('rejects invalid signatures with the same length as a real signature', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });
    const [token, salt, signature] = security.createCsrfCookieValue().split('.');
    const fakeSignature = Buffer.from('x'.repeat(signature.length)).toString().slice(0, signature.length);

    expect(fakeSignature).toHaveLength(signature.length);
    expect(security.isValidCsrfCookieValue(`${token}.${salt}.${fakeSignature}`)).toBe(false);
  });

  it('validates the CSRF cookie from a request cookie header', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });
    const cookieValue = security.createCsrfCookieValue();

    expect(security.hasValidCsrfCookie(request({
      headers: {
        cookie: `other=value; ${cookieHeaderFromValue(cookieValue)}; another=value`,
      },
    }))).toBe(true);
  });

  it('rejects missing and invalid request CSRF cookies', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });

    expect(security.hasValidCsrfCookie(request())).toBe(false);
    expect(security.hasValidCsrfCookie(request({
      headers: {
        cookie: cookieHeaderFromValue('invalid'),
      },
    }))).toBe(false);
  });

  it('sets HttpOnly, Strict, path, and max-age cookie attributes', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret', csrfCookieMaxAgeSeconds: 60 });
    const header = security.csrfCookieHeader(request({
      headers: {
        host: 'localhost:8787',
      },
    }));

    expect(header).toContain('shopping_list_csrf=');
    expect(header).toContain('Path=/');
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Strict');
    expect(header).toContain('Max-Age=60');
    expect(header).not.toContain('Secure');
    expect(security.isValidCsrfCookieValue(cookieValueFromHeader(header))).toBe(true);
  });

  it('adds Secure to the CSRF cookie for HTTPS requests', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });

    expect(security.csrfCookieHeader(request({
      headers: {
        host: 'shopping.example.com',
      },
      encrypted: true,
    }))).toContain('Secure');
  });

  it('adds Secure when forwarded proto is HTTPS', () => {
    const security = createUnknownProductSecurity({ csrfSecret: 'test-secret' });

    expect(security.csrfCookieHeader(request({
      headers: {
        host: 'internal:8787',
        'x-forwarded-host': 'shopping.example.com',
        'x-forwarded-proto': 'https',
      },
    }))).toContain('Secure');
  });

  it('accepts same-origin requests using Origin', () => {
    const security = createUnknownProductSecurity();

    expect(security.isSameOriginRequest(request({
      headers: {
        host: 'shopping.example.com',
        origin: 'http://shopping.example.com',
      },
    }))).toBe(true);
  });

  it('accepts same-origin requests using Referer', () => {
    const security = createUnknownProductSecurity();

    expect(security.isSameOriginRequest(request({
      headers: {
        host: 'shopping.example.com',
        referer: 'http://shopping.example.com/route',
      },
    }))).toBe(true);
  });

  it('accepts forwarded proxy origins', () => {
    const security = createUnknownProductSecurity();

    expect(security.requestExpectedOrigin(request({
      headers: {
        host: 'internal:8787',
        'x-forwarded-host': 'shopping.example.com',
        'x-forwarded-proto': 'https',
      },
    }))).toBe('https://shopping.example.com');
    expect(security.isSameOriginRequest(request({
      headers: {
        host: 'internal:8787',
        origin: 'https://shopping.example.com',
        'x-forwarded-host': 'shopping.example.com',
        'x-forwarded-proto': 'https',
      },
    }))).toBe(true);
  });

  it('accepts explicitly trusted origins', () => {
    const security = createUnknownProductSecurity({ allowedOrigins: 'https://shopping.example.com, https://app.example.com' });

    expect(security.isSameOriginRequest(request({
      headers: {
        host: 'internal:8787',
        origin: 'https://app.example.com',
      },
    }))).toBe(true);
  });

  it('rejects missing, malformed, and cross-site origins', () => {
    const security = createUnknownProductSecurity();

    expect(security.isSameOriginRequest(request({
      headers: {
        host: 'shopping.example.com',
      },
    }))).toBe(false);
    expect(security.isSameOriginRequest(request({
      headers: {
        host: 'shopping.example.com',
        origin: 'not a url',
      },
    }))).toBe(false);
    expect(security.isSameOriginRequest(request({
      headers: {
        host: 'shopping.example.com',
        origin: 'https://evil.example.com',
      },
    }))).toBe(false);
  });

  it('rate limits by remote address', () => {
    const security = createUnknownProductSecurity({ rateLimit: 2, rateLimitWindowMs: 1000 });
    const reportRequest = request({ remoteAddress: '203.0.113.10' });

    expect(security.isRateLimited(reportRequest)).toBe(false);
    expect(security.isRateLimited(reportRequest)).toBe(false);
    expect(security.isRateLimited(reportRequest)).toBe(true);
  });

  it('tracks rate limits separately by forwarded address', () => {
    const security = createUnknownProductSecurity({ rateLimit: 1, rateLimitWindowMs: 1000 });

    expect(security.isRateLimited(request({ headers: { 'x-forwarded-for': '203.0.113.10' } }))).toBe(false);
    expect(security.isRateLimited(request({ headers: { 'x-forwarded-for': '203.0.113.11' } }))).toBe(false);
    expect(security.isRateLimited(request({ headers: { 'x-forwarded-for': '203.0.113.10' } }))).toBe(true);
  });

  it('resets rate limits after the window expires', () => {
    let currentTime = 1_000;
    const security = createUnknownProductSecurity({
      now: () => currentTime,
      rateLimit: 1,
      rateLimitWindowMs: 100,
    });
    const reportRequest = request({ remoteAddress: '203.0.113.10' });

    expect(security.isRateLimited(reportRequest)).toBe(false);
    expect(security.isRateLimited(reportRequest)).toBe(true);

    currentTime = 1_101;
    expect(security.isRateLimited(reportRequest)).toBe(false);
  });

  it('falls back to default rate limit values when env values are invalid', () => {
    const security = createUnknownProductSecurity({ rateLimit: 'invalid', rateLimitWindowMs: 'invalid' });
    const reportRequest = request({ remoteAddress: '203.0.113.10' });

    for (let index = 0; index < 30; index += 1) {
      expect(security.isRateLimited(reportRequest)).toBe(false);
    }
    expect(security.isRateLimited(reportRequest)).toBe(true);
  });
});
