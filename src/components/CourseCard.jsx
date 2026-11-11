import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, PlayCircle, Star, Languages, BarChart3, Brain, Sparkles, Briefcase, Bot, Cloud, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/constants';

export const categoryIcons = {
  'AI Basics': Brain, 'Prompt Engineering': Sparkles, 'AI for Business': Briefcase,
  'AI Agents': Bot, 'Cloud & AI': Cloud, 'AI for Teachers': GraduationCap,
};
const levelColor = { Beginner: 'text-emerald-400 bg-emerald-500/10', Intermediate: 'text-amber-400 bg-amber-500/10', Advanced: 'text-rose-400 bg-rose-500/10' };

export const hours = (minutes) => {
  const h = minutes / 60;
  return h >= 1 ? `${Math.round(h * 10) / 10}h` : `${minutes}m`;
};

export function gradient(course, angle = 135) {
  const [a, b] = course.cover_gradient || ['#7c3aed', '#2563eb'];
  return `linear-gradient(${angle}deg, ${a}, ${b})`;
}

const CourseCard = forwardRef(function CourseCard({ course, index = 0 }, ref) {
  const { t, currency } = useApp();
  const Icon = categoryIcons[course.category] || Brain;
  const price = formatPrice(course.price_usd, currency);
  const pct = course.progress_percent ?? 0;
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link to={`/courses/${course.slug}`} data-course={course.slug} className="glass flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-glow">
        <div className="relative h-36 overflow-hidden" style={{ background: gradient(course) }}>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
          <Icon className="absolute -bottom-4 -right-4 text-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" size={120} />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{course.category}</span>
          </div>
          {course.enrolled && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
              <CheckCircle2 size={12} /> {pct >= 100 ? t('courses.completedBadge') : t('courses.enrolledBadge')}
            </span>
          )}
          <PlayCircle className="absolute bottom-4 left-4 text-white opacity-0 transition-all duration-300 group-hover:opacity-100" size={34} />
          {course.enrolled && (
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30" aria-label={t('courses.progressLabel', { n: pct })}>
              <div className="h-full bg-gradient-to-r from-gold to-white" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="text-lg font-semibold leading-snug">{course.title}</h3>
            {course.subtitle && <p className="line-clamp-1 text-xs text-muted">{course.subtitle}</p>}
            <p className="mt-1 text-xs text-muted">{course.instructor_name}</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
            <span className="flex items-center gap-1"><Clock size={14} /> {hours(course.duration_minutes)}</span>
            <span className="flex items-center gap-1"><PlayCircle size={14} /> {t('courses.lessons', { n: course.lessons_count })}</span>
            <span className="flex items-center gap-1"><Languages size={14} /> {course.language}</span>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${levelColor[course.level]}`}><BarChart3 size={12} /> {course.level}</span>
              <span className="flex items-center gap-1 text-xs font-semibold"><Star size={14} className="fill-gold text-gold" /> {course.rating}</span>
            </div>
            {course.enrolled
              ? <span className="text-sm font-bold text-emerald-400">{t('courses.percentDone', { n: pct })}</span>
              : <span className={`font-display text-lg font-bold ${price ? '' : 'text-emerald-400'}`}>{price || t('courses.free')}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default CourseCard;
