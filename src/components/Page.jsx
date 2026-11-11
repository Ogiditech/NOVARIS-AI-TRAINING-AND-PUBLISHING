import { useEffect } from 'react';
import { motion, PresenceContext } from 'framer-motion';

export default function Page({ children }) {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/*
        Only this wrapper takes part in the page-to-page transition. Shielding the
        page content stops inner layout animations (tab highlights, animated grids)
        from registering with the route transition and leaving it waiting forever
        when they unmount during a route change (e.g. switching Store tabs).
      */}
      <PresenceContext.Provider value={null}>{children}</PresenceContext.Provider>
    </motion.div>
  );
}
