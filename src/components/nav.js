import { Home, LayoutDashboard, GraduationCap, Store, Package, Calendar, User, Gem, Phone } from 'lucide-react';

export const navItems = [
  { to: '/', key: 'home', icon: Home, mobile: true },
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard, mobile: true },
  { to: '/courses', key: 'courses', icon: GraduationCap, mobile: true },
  // Store opens both the eBooks and Digital Products tabs. Desktop shows Digital Products as a sub-item.
  { to: '/ebooks', key: 'ebooks', icon: Store, mobile: true, match: ['/ebooks', '/products', '/library'], children: [{ to: '/products', key: 'products', icon: Package, match: ['/products'] }] },
  { to: '/live', key: 'live', icon: Calendar, mobile: true },
  { to: '/profile', key: 'profile', icon: User },
  { to: '/pricing', key: 'pricing', icon: Gem },
  { to: '/contact', key: 'contact', icon: Phone },
];

// Is this nav item active for the current path? `match` lists extra path prefixes.
export function isNavActive(item, pathname, { excludeChildren = false } = {}) {
  if (!item.match) return item.to === '/' ? pathname === '/' : pathname === item.to || pathname.startsWith(`${item.to}/`);
  const childPaths = excludeChildren ? (item.children || []).flatMap((c) => c.match || [c.to]) : [];
  return item.match
    .filter((m) => !childPaths.includes(m))
    .some((m) => pathname === m || pathname.startsWith(`${m}/`));
}
