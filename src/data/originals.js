// Novaris Originals — eBooks published from content/ebooks/*.md by scripts/build-ebooks.js.
// Only the generated JSON (free sample sections + teasers for locked ones) is ever bundled.
// The small index is loaded up front; each book's text is a separate chunk loaded when it is opened.
const indexModules = import.meta.glob('./ebooks/index.json', { eager: true, import: 'default' });
const bookModules = import.meta.glob(['./ebooks/*.json', '!./ebooks/index.json'], { import: 'default' });

export const originals = Object.values(indexModules)[0] || [];

export const findOriginal = (slug) => originals.find((b) => b.slug === slug) || null;

export async function loadOriginal(slug) {
  const load = bookModules[`./ebooks/${slug}.json`];
  return load ? load() : null;
}

/** Shape expected by <BookCover>. */
export const coverProps = (b) => ({ slug: b.slug, title: b.title, subtitle: b.subtitle, author_name: b.author, cover_gradient: b.cover });

export const NOTIFY = {
  whatsapp: '971524605012',
  email: 'samomurok@gmail.com',
};

export const notifyLinks = (book) => {
  const msg = `Hello! Please notify me when the full edition of "${book.title}" by ${book.author} is available on Novaris.`;
  return {
    whatsapp: `https://wa.me/${NOTIFY.whatsapp}?text=${encodeURIComponent(msg)}`,
    email: `mailto:${NOTIFY.email}?subject=${encodeURIComponent(`Notify me: ${book.title}`)}&body=${encodeURIComponent(msg)}`,
  };
};
