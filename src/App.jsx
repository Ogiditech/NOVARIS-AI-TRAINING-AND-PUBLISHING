import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Toasts from './components/Toasts';
import SearchDialog from './components/SearchDialog';
import CheckoutModal from './components/CheckoutModal';
import Page from './components/Page';
import { DatabaseDown, PageSkeleton, RequireAuth } from './components/states';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';

// Heavier screens are loaded on demand to keep the first load fast.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));
const Certificate = lazy(() => import('./pages/Certificate'));
const Verify = lazy(() => import('./pages/Verify'));
const Store = lazy(() => import('./pages/Store'));
const EbookReader = lazy(() => import('./pages/EbookReader'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Library = lazy(() => import('./pages/Library'));
const LiveClasses = lazy(() => import('./pages/LiveClasses'));
const Profile = lazy(() => import('./pages/Profile'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Contact = lazy(() => import('./pages/Contact'));
const Publish = lazy(() => import('./pages/Publish'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

const page = (el) => <Page><Suspense fallback={<PageSkeleton />}>{el}</Suspense></Page>;
const privatePage = (el) => page(<RequireAuth>{el}</RequireAuth>);

export default function App() {
  const location = useLocation();
  const { status, refresh } = useAuth();
  // Both Store tabs share one page so switching tabs does not replay the page transition.
  const pageKey = ['/ebooks', '/products'].includes(location.pathname) ? '/store' : location.pathname;

  // Login and sign up are full-screen experiences (no sidebar or navigation bars).
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return (
      <div className="relative min-h-screen bg-bg">
        <Suspense fallback={<div className="min-h-screen" />}>
          {location.pathname === '/login' ? <Login /> : <Signup />}
        </Suspense>
        <Toasts />
      </div>
    );
  }

  return (
    <div className="aurora relative min-h-screen">
      <Sidebar />
      <div className="relative z-10 lg:pl-72">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-10 lg:pb-12">
          {status === 'offline' ? (
            <DatabaseDown fullPage onRetry={refresh} />
          ) : (
            <AnimatePresence mode="wait">
              <Routes location={location} key={pageKey}>
                <Route path="/" element={<Page><Landing /></Page>} />
                <Route path="/dashboard" element={privatePage(<Dashboard />)} />
                <Route path="/courses" element={page(<Courses />)} />
                <Route path="/courses/:slug" element={page(<CourseDetails />)} />
                <Route path="/learn/:slug" element={page(<LessonPlayer />)} />
                <Route path="/certificates/:code" element={privatePage(<Certificate />)} />
                <Route path="/verify/:code" element={page(<Verify />)} />
                {/* One parent route for both Store tabs keeps the same page mounted when switching tabs. */}
                <Route element={page(<Store />)}>
                  <Route path="/ebooks" element={null} />
                  <Route path="/products" element={null} />
                </Route>
                <Route path="/ebooks/:slug/read" element={page(<EbookReader />)} />
                <Route path="/products/:slug" element={page(<ProductDetails />)} />
                <Route path="/library" element={privatePage(<Library />)} />
                <Route path="/live" element={page(<LiveClasses />)} />
                <Route path="/profile" element={privatePage(<Profile />)} />
                <Route path="/pricing" element={page(<Pricing />)} />
                <Route path="/contact" element={page(<Contact />)} />
                <Route path="/publish" element={page(<Publish />)} />
                <Route path="/about" element={page(<InfoPage page="about" />)} />
                <Route path="/privacy" element={page(<InfoPage page="privacy" />)} />
                <Route path="/terms" element={page(<InfoPage page="terms" />)} />
                <Route path="*" element={<Page><NotFound /></Page>} />
              </Routes>
            </AnimatePresence>
          )}
        </main>
        <Footer />
      </div>
      <BottomNav />
      <SearchDialog />
      <CheckoutModal />
      <Toasts />
    </div>
  );
}
