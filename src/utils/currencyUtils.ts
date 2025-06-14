import { Currency, currencies } from "@/components/pricing/CurrencySelector";

// Detect user's local currency based on locale
export const detectLocalCurrency = (): Currency => {
  try {
    // Try to get timezone first
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Map common timezones to currencies
    const timezoneToCurrency: Record<string, string> = {
      'America/New_York': 'USD',
      'America/Los_Angeles': 'USD',
      'America/Chicago': 'USD',
      'America/Denver': 'USD',
      'Europe/London': 'GBP',
      'Europe/Paris': 'EUR',
      'Europe/Berlin': 'EUR',
      'Europe/Rome': 'EUR',
      'Europe/Madrid': 'EUR',
      'Asia/Kolkata': 'INR',
      'Asia/Mumbai': 'INR',
      'Asia/Tokyo': 'JPY',
      'Asia/Shanghai': 'CNY',
      'America/Toronto': 'CAD',
      'America/Vancouver': 'CAD',
      'Australia/Sydney': 'AUD',
      'Australia/Melbourne': 'AUD',
      'America/Sao_Paulo': 'BRL',
      'America/Mexico_City': 'MXN',
    };

    const currencyCode = timezoneToCurrency[timezone];
    if (currencyCode) {
      const currency = currencies.find(c => c.code === currencyCode);
      if (currency) return currency;
    }

    // Fallback to locale-based detection
    const locale = navigator.language || 'en-US';
    const localeToCurrency: Record<string, string> = {
      'en-US': 'USD',
      'en-GB': 'GBP',
      'en-CA': 'CAD',
      'en-AU': 'AUD',
      'fr-FR': 'EUR',
      'de-DE': 'EUR',
      'es-ES': 'EUR',
      'it-IT': 'EUR',
      'hi-IN': 'INR',
      'en-IN': 'INR',
      'ja-JP': 'JPY',
      'zh-CN': 'CNY',
      'pt-BR': 'BRL',
      'es-MX': 'MXN',
    };

    const fallbackCode = localeToCurrency[locale] || 'USD';
    return currencies.find(c => c.code === fallbackCode) || currencies[0];
  } catch (error) {
    console.error('Error detecting local currency:', error);
    return currencies[0]; // Default to USD
  }
};

export const formatPrice = (usdPrice: number, currency: Currency): string => {
  const convertedPrice = usdPrice * currency.rate;
  
  // Round to appropriate decimal places based on currency
  let roundedPrice: number;
  if (currency.code === 'JPY' || currency.code === 'CNY') {
    roundedPrice = Math.round(convertedPrice);
  } else {
    roundedPrice = Math.round(convertedPrice * 10) / 10; // Round to nearest 0.1
  }

  return `${currency.symbol}${roundedPrice.toLocaleString()}`;
};

export const formatPriceWithPeriod = (usdPrice: number, currency: Currency, period: 'monthly' | 'yearly'): string => {
  const price = formatPrice(usdPrice, currency);
  return period === 'yearly' ? `${price}/year` : `${price}/month`;
};