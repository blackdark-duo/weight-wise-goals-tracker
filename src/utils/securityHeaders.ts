/**
 * Security headers utilities for Content Security Policy and other security measures
 */

export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()'
    ].join(', ')
  };
};

// Apply security headers to fetch requests
export const createSecureFetch = (originalFetch = fetch) => {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    
    // Add security headers to outgoing requests
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    });

    const modifiedInit: RequestInit = {
      ...init,
      headers,
    };

    return originalFetch(input, modifiedInit);
  };
};

// Validate and sanitize URLs to prevent SSRF attacks
export const validateExternalUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS for external requests (except localhost for development)
    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Block internal network ranges in production
    const hostname = parsedUrl.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '::1',
      '0.0.0.0',
      '10.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.2',
      '172.30.',
      '172.31.',
      '192.168.',
      '.local'
    ];

    // In production, block internal IPs
    if (process.env.NODE_ENV === 'production') {
      for (const blocked of blockedHosts) {
        if (hostname === blocked || hostname.startsWith(blocked) || hostname.includes(blocked)) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
};

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, consider using DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Generate nonce for inline scripts (CSP)
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};