import { FileText, LayoutTemplate, Package, NotebookPen, ListChecks, Layers } from 'lucide-react';

export const typeIcons = {
  'Prompt Pack': FileText,
  Template: LayoutTemplate,
  Toolkit: Package,
  Workbook: NotebookPen,
  'Cheat Sheet': ListChecks,
  Bundle: Layers,
};

const sizes = {
  xl: { icon: 96, ring: 'h-40 w-40', pad: 'rounded-3xl' },
  md: { icon: 52, ring: 'h-24 w-24', pad: 'rounded-none' },
  sm: { icon: 30, ring: 'h-14 w-14', pad: 'rounded-xl' },
  xs: { icon: 18, ring: 'h-9 w-9', pad: 'rounded-lg' },
};

// Generated gradient cover with a large product-type icon — no images needed.
export default function ProductCover({ product, size = 'md', className = '' }) {
  const [a, b] = product.cover_gradient;
  const Icon = typeIcons[product.product_type] || FileText;
  const s = sizes[size];
  const seed = product.slug.length;
  return (
    <div className={`relative isolate grid place-items-center overflow-hidden ${s.pad} ${className}`} style={{ background: `linear-gradient(140deg, ${a} 0%, ${b} 100%)` }}>
      {size !== 'xs' && (
        <>
          <div className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: size === 'sm' ? '8px 8px' : '16px 16px' }} />
          <div className="absolute -z-10 h-[140%] w-[140%] opacity-50" style={{ background: `radial-gradient(circle at ${25 + (seed % 5) * 12}% ${20 + (seed % 3) * 15}%, rgba(255,255,255,.45), transparent 40%)` }} />
        </>
      )}
      <div className={`grid ${s.ring} place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}>
        <Icon size={s.icon} strokeWidth={1.6} className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,.25)]" />
      </div>
    </div>
  );
}
