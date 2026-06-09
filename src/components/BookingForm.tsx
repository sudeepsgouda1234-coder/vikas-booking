import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, AlertCircle, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Service } from '../types';

interface BookingFormProps {
  services: Service[];
  selectedService: string;
  setSelectedService: (svc: string) => void;
  onBookingSuccess: (bookingData: any) => void;
}

export default function BookingForm({
  services,
  selectedService,
  setSelectedService,
  onBookingSuccess
}: BookingFormProps) {
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(() => {
    // Default to today or tomorrow depending on current hour
    const d = new Date();
    // Default format YYYY-MM-DD
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Fetch available slots whenever date changes
  useEffect(() => {
    if (!date) return;
    
    setIsLoadingSlots(true);
    setValidationError('');
    setErrorMessage('');
    
    fetch(`/api/availability?date=${date}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load slots');
        return res.json();
      })
      .then((data) => {
        setSlots(data.availableSlots || []);
        // Auto-select first slot if available
        if (data.availableSlots && data.availableSlots.length > 0) {
          setTime(data.availableSlots[0]);
        } else {
          setTime('');
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage('Could not load available time slots for this date.');
      })
      .finally(() => {
        setIsLoadingSlots(false);
      });
  }, [date]);

  // Form Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setErrorMessage('');

    if (!name.trim()) return setValidationError('Full Name is required.');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setValidationError('Please enter a valid email address.');
    if (!phone.trim()) return setValidationError('Phone number is required.');
    
    // Clean spaces, hyphens, parentheses
    const cleanedPhone = phone.replace(/[\s\-()]/g, '');
    // Allow either international/Indian format, like +91 9876543210, 9876543210, +91-98765-43210, etc.
    const phoneRegex = /^(\+91[\-\s]?)?[0-9]{10}$|^(\+[0-9]{1,4}[\-\s]?)?[0-9]{7,15}$|^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return setValidationError('Please enter a valid phone number (e.g. +91 98765 43210 or 10-digit number).');
    }
    if (!selectedService) return setValidationError('Please choose a session service type.');
    if (!date) return setValidationError('Please select a calendar date.');
    if (!time) return setValidationError('Please choose an available time slot.');

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          serviceType: selectedService,
          date,
          time,
          notes
        })
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'The requested slot was just booked! Please choose another slot.');
      }

      // Safe booking confirmation
      onBookingSuccess(body);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong and booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking-form-sec" className="py-20 transition-colors bg-transparent relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Main interactive scheduler container */}
        <div className="bg-[#111113] border border-white/10 rounded-[32px] p-8 sm:p-12 shadow-2xl relative">
          {/* Active indicator dot */}
          <div className="absolute top-0 right-0 p-8 sm:p-12">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="mb-10 text-left">
            <span className="text-[10px] uppercase font-bold text-gold tracking-widest flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
              Book your session
            </span>
            <h2 className="text-3xl font-extralight text-white font-display">Advisory Scheduler</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Validation errors */}
            {validationError && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm flex gap-2 items-center">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* API Error alerts */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex gap-2 items-center">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Personal info */}
              <div className="space-y-5">
                <h3 className="font-extrabold text-xs text-white/40 uppercase tracking-wider">1. Your Credentials</h3>
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullname" className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                    <input
                      id="fullname"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 placeholder-white/20 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email address */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 placeholder-white/20 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 placeholder-white/20 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Select Service type */}
                <div className="space-y-2">
                  <label htmlFor="service" className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">Select consultation service</label>
                  <select
                    id="service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
                  >
                    <option value="" disabled className="bg-slate-900 text-white/40">-- Select a consulting package --</option>
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.name} className="bg-[#111113] text-white">
                        {svc.name} ({svc.duration} mins) - {svc.price === 0 ? 'Free' : `₹${svc.price.toLocaleString('en-IN')}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column: Scheduling */}
              <div className="space-y-5">
                <h3 className="font-extrabold text-xs text-white/40 uppercase tracking-wider">2. Date & Time</h3>
                
                {/* Appointment Date */}
                <div className="space-y-2">
                  <label htmlFor="date" className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">Appointment Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                    <input
                      id="date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]} // prevent yesterdays
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Available Time Slot pills selection */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">
                    Available Times for {date}
                  </label>
                  
                  {isLoadingSlots ? (
                    <div className="flex gap-2 items-center py-4 text-xs font-medium text-white/40 font-mono">
                      <div className="h-4.5 w-4.5 border-2 border-white/35 border-t-gold rounded-full animate-spin" />
                      <span>Retrieving open slots...</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-black/20 text-xs text-white/40 border border-white/5 font-mono leading-relaxed">
                      🚫 No vacant slots left on this day. Vikas operates regular office hours, Monday - Sunday. Please try another calendar date!
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setTime(s)}
                          className={`py-3 rounded-lg font-mono text-center border text-xs transition-all truncate flex items-center justify-center gap-1.5 ${
                            time === s
                              ? 'border-gold bg-gold/10 text-gold font-bold shadow-[0_0_12px_rgba(197,160,89,0.2)]'
                              : 'border-white/5 hover:border-gold text-white/70 hover:text-white bg-black/20'
                          }`}
                        >
                          {time === s && <Check className="h-3 w-3 text-gold" />}
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes/Message explanation */}
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">
                    Agenda / Private Notes <span className="text-white/20 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                    <textarea
                      id="notes"
                      rows={2}
                      placeholder="Briefly share what you would like to audit, prioritize, or accomplish in this session."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 placeholder-white/20 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* CTA action button exactly matching luxury styling */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4.5 w-4.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    Completing registration...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
              
              <p className="text-center mt-4 text-[10px] text-white/20 italic">
                Instant confirmation and calendar invite will be sent upon booking.
              </p>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}
