import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServiceCard from './components/ServiceCard';
import BookingForm from './components/BookingForm';
import Testimonials from './components/Testimonials';
import BookingSuccess from './components/BookingSuccess';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { Service, Booking } from './types';
import { CalendarDays, AlertCircle, FileText } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme_preference');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Flow State
  const [activeTab, setActiveTab] = useState<'landing' | 'admin'>('landing');
  const [bookingStep, setBookingStep] = useState<'form' | 'success'>('form');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [emailAlerts, setEmailAlerts] = useState<any | null>(null);

  // Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('book_vikas_secure_admin_token');
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Static/Fetched Data
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Apply visual theme preferences
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_preference', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_preference', 'light');
    }
  }, [darkMode]);

  // Read services list on mount
  useEffect(() => {
    setIsLoadingServices(true);
    setLoadError('');
    fetch('/api/services')
      .then((res) => {
        if (!res.ok) throw new Error('Could not retrieve consulting packages.');
        return res.json();
      })
      .then((data) => {
        setServices(data);
        if (data.length > 0) {
          setSelectedService(data[0].name); // Select first service by default
        }
      })
      .catch((err: any) => {
        console.error(err);
        setLoadError(err.message || 'Error loading services catalog.');
      })
      .finally(() => {
        setIsLoadingServices(false);
      });
  }, []);

  // Handle successful scheduling
  const handleBookingSuccess = (responseBody: any) => {
    setConfirmedBooking(responseBody.booking);
    setEmailAlerts(responseBody.emailAlerts);
    setBookingStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset scheduling module flow
  const handleResetBooking = () => {
    setConfirmedBooking(null);
    setEmailAlerts(null);
    setBookingStep('form');
    if (services.length > 0) {
      setSelectedService(services[0].name);
    }
  };

  // Switch tabs (Landing vs Admin Dashboard)
  const handleAdminTabRedirect = () => {
    if (adminToken) {
      setActiveTab('admin');
      setBookingStep('form');
    } else {
      setShowLoginModal(true);
    }
  };

  // Handle login completion
  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('book_vikas_secure_admin_token', token);
    setShowLoginModal(false);
    setActiveTab('admin');
  };

  // Admin Logout
  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('book_vikas_secure_admin_token');
    setActiveTab('landing');
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Header and top navigation action bar */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onAdminClick={handleAdminTabRedirect}
        isAdminLoggedIn={!!adminToken}
        onBookClick={() => {
          setActiveTab('landing');
          setBookingStep('form');
          setTimeout(() => {
            const el = document.getElementById('booking-form-sec');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onLogout={handleLogout}
      />

      {/* Main View Coordinates */}
      <main className="w-full relative">
        {activeTab === 'landing' ? (
          // CLIENT EXPERIENCE - Book Appointments
          bookingStep === 'success' && confirmedBooking ? (
            <BookingSuccess
              booking={confirmedBooking}
              emailAlerts={emailAlerts}
              onReset={handleResetBooking}
            />
          ) : (
            <div className="space-y-6">
              {/* Profile intro block banner */}
              <Hero
                onBookClick={() => {
                  const formSec = document.getElementById('booking-form-sec');
                  if (formSec) formSec.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Service listing grid */}
              {isLoadingServices ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400 font-mono text-sm">
                  <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                  <span>Loading available services...</span>
                </div>
              ) : loadError ? (
                <div className="max-w-xl mx-auto p-6 bg-red-400/5 border border-red-500/10 text-red-500 text-xs text-center rounded-2xl flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0" />
                  <span>{loadError} Failed to establish live connection. Please double-check server.ts is booting correctly.</span>
                </div>
              ) : (
                <ServiceCard
                  services={services}
                  onSelectService={(svcName) => {
                    setSelectedService(svcName);
                    setTimeout(() => {
                      const formSec = document.getElementById('booking-form-sec');
                      if (formSec) formSec.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                />
              )}

              {/* Interactive slot booking form */}
              {!isLoadingServices && !loadError && (
                <BookingForm
                  services={services}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  onBookingSuccess={handleBookingSuccess}
                />
              )}

              {/* Client testimonials and contact metrics */}
              <Testimonials />
            </div>
          )
        ) : (
          // ADMIN DASHBOARD
          <AdminPanel
            token={adminToken || ''}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Admin Login Popup Verification */}
      {showLoginModal && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* humble minimal corporate footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-8 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; 2026 Book your friend Vikas. All Rights Reserved. Scheduled appointments sync with email alert relays.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-700 dark:hover:text-white cursor-pointer" onClick={() => handleAdminTabRedirect()}>Vikas Admin Console</span>
            <span>•</span>
            <span className="hover:text-slate-700 dark:hover:text-white cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Return to Top</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
