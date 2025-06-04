/**
 * Input validation utilities for security
 */

// URL validation for webhooks
export const validateWebhookUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Prevent internal network access (SSRF protection)
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost and internal IPs
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.2') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname === '0.0.0.0' ||
      hostname.includes('.local')
    ) {
      return { isValid: false, error: 'Internal network URLs are not allowed' };
    }

    // URL length check
    if (url.length > 2048) {
      return { isValid: false, error: 'URL is too long (max 2048 characters)' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// Weight validation
export const validateWeight = (weight: number, unit: string): { isValid: boolean; error?: string } => {
  if (typeof weight !== 'number' || isNaN(weight)) {
    return { isValid: false, error: 'Weight must be a valid number' };
  }

  if (weight <= 0) {
    return { isValid: false, error: 'Weight must be greater than 0' };
  }

  // Reasonable weight limits based on unit
  const limits = {
    kg: { min: 1, max: 1000 }, // 1kg to 1000kg
    lb: { min: 2, max: 2200 }, // 2lb to 2200lb
    st: { min: 0.1, max: 157 }, // 0.1 stone to 157 stone
  };

  const limit = limits[unit as keyof typeof limits];
  if (!limit) {
    return { isValid: false, error: 'Invalid weight unit' };
  }

  if (weight < limit.min || weight > limit.max) {
    return { 
      isValid: false, 
      error: `Weight must be between ${limit.min} and ${limit.max} ${unit}` 
    };
  }

  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Length check
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  // Check for dangerous characters
  if (email.includes('<') || email.includes('>') || email.includes('"')) {
    return { isValid: false, error: 'Email contains invalid characters' };
  }

  return { isValid: true };
};

// Text input sanitization
export const sanitizeText = (text: string, maxLength: number = 1000): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove potential script tags and HTML
  const sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, maxLength);

  return sanitized;
};

// Validate text input length and content
export const validateTextInput = (text: string, maxLength: number = 1000): { isValid: boolean; error?: string } => {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Text is required' };
  }

  if (text.length > maxLength) {
    return { isValid: false, error: `Text is too long (max ${maxLength} characters)` };
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /on\w+\s*=/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: 'Text contains potentially dangerous content' };
    }
  }

  return { isValid: true };
};