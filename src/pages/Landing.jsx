import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles, Users, Globe, Award, Library, PlayCircle, Calendar, PenTool } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Counter, fadeUp } from '../components/ui';
import WorldMap from '../components/WorldMap';
import TipOfDay from '../components/TipOfDay';
import ContactBlock from '../components/ContactBlock';
import FreeResources from '../components/FreeResources';
import CourseCard from '../components/CourseCard';
import BookCover from '../components/BookCover';
import { CardGridSkeleton } from '../components/states';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { formatPrice, tools } from '../data/constants';

export default function Landing() {
  const { t, currency } = useApp();
  const { user } = useAuth();
  const { data } = useApi('/stats');
  const startTo = user ? '/dashboard' : '/signup';
  const stats = [
    { key: 'learners', value: data?.learners ?? 0, icon: Users },
    { key: 'countries', value: data?.countries ?? 0, icon: Globe },
    { key: 'completed', value: data?.completed ?? 0, icon: Award },
    { key: 'ebooks', value: data?.ebooks ?? 0, icon: Library },
  ];
  const features = t('hero.features');
  const featureIcons = [PlayCircle, Calendar, Award, PenTool];

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* HERO */}
      <section className="relative pt-6 text-center sm:pt-14">
        <motion.div initial="hidden" animate="show" className="mx-auto max-w-4xl">
          <motion.p variants={fadeUp} custom={0} className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/10 px-4 py-1.5 text-xs font-semibold text-violet-300 dark:text-violet-300">
            <Sparkles size={14} className="text-gold" /> {t('hero.eyebrow')}
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="mt-6 text-[2.75rem] font-bold leading-[1.02] sm:text-7xl lg:text-8xl">
            {t('hero.title1')}<br />
            <span className="text-brand">{t('hero.title2')}</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg">
            <span className="font-semibold text-ink">{t('brand.name')}</span> — {t('hero.subtitle')}
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={startTo} className="btn-primary px-7 py-4 text-base">{t('hero.ctaLearn')} <ArrowRight size={18} /></Link>
            <Link to="/ebooks" className="btn-ghost px-7 py-4 text-base"><BookOpen size={18} /> {t('hero.ctaBooks')}</Link>
          </motion.div>
        </motion.div>

        {/* stats */}
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map(({ key, value, icon: Icon, suffix }, i) => (
            <motion.div key={key} variants={fadeUp} custom={i + 4} initial="hidden" animate="show" whileHover={{ y: -4 }} className="glass p-5 text-left">
              <Icon size={20} className="text-violet-400" />
              <p className="mt-3 font-display text-2xl font-bold sm:text-4xl"><Counter to={value} suffix={suffix} /></p>
              <p className="mt-1 text-xs text-muted sm:text-sm">{t(`hero.stats.${key}`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MAP */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }} className="glass relative overflow-hidden p-4 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent" />
        <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{t('hero.mapTitle')}</h2>
            <p className="text-sm text-muted">{t('hero.mapCaption', { n: data?.countries ?? 0 })}</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
            {t('hero.activeWeek')}<Counter to={data?.activeThisWeek ?? 0} duration={1.5} />
          </span>
        </div>
        <div className="relative"><WorldMap points={data?.countryList} /></div>
      </motion.section>

      {/* TOOLS strip */}
      <section>
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[.25em] text-muted">{t('hero.toolsTitle')}</p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="marquee flex w-max gap-4">
            {[...tools, ...tools].map((tool, i) => (
              <span key={i} className="glass whitespace-nowrap !rounded-2xl px-6 py-3 font-display text-lg font-semibold text-ink/80">
                <Sparkles size={14} className="mr-2 inline text-violet-400" />{tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <h2 className="mx-auto mb-10 max-w-2xl text-center text-3xl font-bold sm:text-4xl">{t('hero.featuresTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }} className="glass group p-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white shadow-glow transition-transform group-hover:scale-110"><Icon size={22} /></div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <FreeResources />

      <TipOfDay />

      {/* POPULAR COURSES */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-bold">{t('hero.popular')}</h2>
          <Link to="/courses" className="flex min-h-[40px] items-center gap-1 text-sm font-semibold text-violet-400 hover:text-violet-300">{t('nav.courses')} <ArrowRight size={16} /></Link>
        </div>
        {data ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {data.featured.map((c, i) => <CourseCard key={c.slug} course={c} index={i} />)}
          </div>
        ) : <CardGridSkeleton count={4} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" />}
      </section>

      {/* BESTSELLING EBOOKS */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-bold">{t('hero.bestsellers')}</h2>
          <Link to="/ebooks" className="flex min-h-[40px] items-center gap-1 text-sm font-semibold text-violet-400 hover:text-violet-300">{t('hero.ctaBooks')} <ArrowRight size={16} /></Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {(data?.bestsellers || []).map((b, i) => (
            <motion.div key={b.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }}>
              <Link to={`/ebooks/${b.slug}/read`} className="glass group flex items-center gap-4 p-4 transition-shadow hover:shadow-glow">
                <BookCover book={b} className="w-24 shrink-0 transition group-hover:-rotate-2" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold">{t('hero.bestsellerBadge')}</p>
                  <p className="mt-1 font-semibold leading-snug">{b.title}</p>
                  <p className="mt-1 text-xs text-muted">{b.author_name} · {b.author_country}</p>
                  <p className="mt-2 font-display font-bold">{formatPrice(b.price_usd, currency) || t('courses.free')}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <ContactBlock />

      {/* CTA */}
      <section className="relative overflow-hidden rounded-[32px] bg-brand p-8 text-center text-white shadow-glow sm:p-14">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl font-bold sm:text-5xl">{t('hero.title1')} {t('hero.title2')}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={startTo} className="btn bg-white px-7 py-4 text-violet-700 hover:-translate-y-0.5">{t('hero.ctaLearn')} <ArrowRight size={18} /></Link>
            <Link to="/pricing" className="btn border border-white/40 px-7 py-4 text-white hover:bg-white/10">{t('nav.pricing')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
