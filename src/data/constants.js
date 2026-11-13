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
// Prices are set in USD; other currencies show a standard local price point (like app stores do):
//   decimal currencies → "x.99" for .99-style prices, whole amounts otherwise
//   step → round UP to this unit; charm → then subtract 1 (₹699, KSh 1,049); without charm → round numbers (USh 30,000)
export const currencies = [
  { code: 'USD', symbol: '$', rate: 1, decimals: true },
  { code: 'EUR', symbol: '€', rate: 0.92, decimals: true },
  { code: 'GBP', symbol: '£', rate: 0.79, decimals: true },
  { code: 'AED', symbol: 'AED ', rate: 3.67, decimals: true },
  { code: 'INR', symbol: '₹', rate: 83.2, step: 50, charm: true },
  { code: 'NGN', symbol: '₦', rate: 1550, step: 500 },
  { code: 'KES', symbol: 'KSh ', rate: 129, step: 50, charm: true },
  { code: 'UGX', symbol: 'USh ', rate: 3700, step: 1000 },
];

export const countries = ['Uganda', 'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Egypt', 'Senegal', 'UAE', 'Saudi Arabia', 'Jordan', 'India', 'Pakistan', 'Bangladesh', 'Indonesia', 'Philippines', 'Japan', 'South Korea', 'Australia', 'United Kingdom', 'France', 'Germany', 'Spain', 'Brazil', 'Mexico', 'Argentina', 'Colombia', 'United States', 'Canada', 'Rwanda', 'Tanzania', 'Ethiopia', 'Morocco', 'Qatar', 'Singapore', 'Italy', 'Netherlands', 'Ireland', 'Portugal', 'Turkey', 'Other'];

/** Local price point for a USD price, e.g. $7.99 → €7.99 · £6.99 · AED 29.99 · ₹699 · ₦12,500 · KSh 1,049 · USh 30,000. */
export function localPrice(usd, currency) {
  const value = Number(usd) || 0;
  if (value === 0) return 0;
  if (currency.code === 'USD' || currency.rate === 1) return value; // the price as set
  const converted = value * currency.rate;
  const charmPrice = Math.round(value * 100) % 100 !== 0; // $7.99-style vs whole $12
  if (currency.decimals) {
    if (!charmPrice) return Math.max(1, Math.round(converted));
    return Math.max(0.99, Math.ceil(converted - 1e-9) - 0.01);
  }
  const step = currency.step || 10;
  const up = Math.max(step, Math.ceil(converted / step) * step);
  return currency.charm && charmPrice ? up - 1 : up;
}

export function formatPrice(usd, currency) {
  const amount = localPrice(usd, currency);
  if (!amount) return null;
  const cents = Math.round(amount * 100) % 100 !== 0;
  const text = amount.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
  return `${currency.symbol}${text}`;
}

export const offices = [
  { id: 'ug', key: 'uganda', flag: '🇺🇬', phone: '+256 785 917 220', tel: 'tel:+256785917220', whatsapp: 'https://wa.me/256785917220' },
  { id: 'ae', key: 'uae', flag: '🇦🇪', phone: '+971 52 460 5012', tel: 'tel:+971524605012', whatsapp: 'https://wa.me/971524605012' },
];
