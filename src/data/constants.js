// Static configuration used by the UI. All learner, course, eBook, class and product data
// now comes from the database through /api — nothing here is user data.

export const categories = ['AI Basics', 'Prompt Engineering', 'AI for Business', 'AI Agents', 'Cloud & AI', 'AI for Teachers'];
export const levels = ['Beginner', 'Intermediate', 'Advanced'];
export const courseLanguages = ['English', 'Arabic', 'French', 'Spanish', 'Swahili'];
export const productTypes = ['Prompt Pack', 'Template', 'Toolkit', 'Workbook', 'Cheat Sheet', 'Bundle'];

export const tools = ['ChatGPT', 'Gemini', 'Claude', 'Azure AI', 'Lovable', 'Copilot', 'Midjourney', 'Perplexity'];

export const subtitleLanguages = ['English', 'العربية', 'Français', 'Español', 'Kiswahili', 'हिन्दी', 'Português'];

// Plan copy lives in the translations file (plans.*).
export const plans = [
  { id: 'Free', priceUSD: 0 },
  { id: 'Pro', priceUSD: 12, popular: true },
  { id: 'Teams', priceUSD: 29, perSeat: true },
];

// Fixed display exchange rates (1 USD = x). Not used for real payments.
export const currencies = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'AED', symbol: 'AED ', rate: 3.67 },
  { code: 'INR', symbol: '₹', rate: 83.2 },
  { code: 'NGN', symbol: '₦', rate: 1550 },
  { code: 'KES', symbol: 'KSh ', rate: 129 },
  { code: 'UGX', symbol: 'USh ', rate: 3700 },
];

export const countries = ['Uganda', 'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Egypt', 'Senegal', 'UAE', 'Saudi Arabia', 'Jordan', 'India', 'Pakistan', 'Bangladesh', 'Indonesia', 'Philippines', 'Japan', 'South Korea', 'Australia', 'United Kingdom', 'France', 'Germany', 'Spain', 'Brazil', 'Mexico', 'Argentina', 'Colombia', 'United States', 'Canada', 'Rwanda', 'Tanzania', 'Ethiopia', 'Morocco', 'Qatar', 'Singapore', 'Italy', 'Netherlands', 'Ireland', 'Portugal', 'Turkey', 'Other'];

export function formatPrice(usd, currency) {
  const value = Number(usd) || 0;
  if (value === 0) return null;
  const converted = value * currency.rate;
  const rounded = currency.rate >= 50 ? Math.round(converted / 10) * 10 : Math.round(converted * 100) / 100;
  const text = rounded.toLocaleString(undefined, { minimumFractionDigits: rounded % 1 ? 2 : 0, maximumFractionDigits: 2 });
  return `${currency.symbol}${text}`;
}

export const offices = [
  { id: 'ug', key: 'uganda', flag: '🇺🇬', phone: '+256 785 917 220', tel: 'tel:+256785917220', whatsapp: 'https://wa.me/256785917220' },
  { id: 'ae', key: 'uae', flag: '🇦🇪', phone: '+971 52 460 5012', tel: 'tel:+971524605012', whatsapp: 'https://wa.me/971524605012' },
];
