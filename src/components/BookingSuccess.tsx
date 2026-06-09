import { CheckCircle2, Calendar, Clock, MapPin, Sparkles, LogOut, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Booking } from '../types';

interface BookingSuccessProps {
  booking: Booking;
  emailAlerts?: {
    customerEmailStatus: string;
    adminEmailStatus: string;
    customerPreview?: string;
    adminPreview?: string;
    usingRealSMTP?: boolean;
  };
  onReset: () => void;
}

export default function BookingSuccess({ booking, emailAlerts, onReset }: BookingSuccessProps) {
  // Construct real Google Calendar links
  const startDateTime = new Date(`${booking.appointmentDate}T${booking.appointmentTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000); // Standard 45 mins session
  
  const formatGCalDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0];
  };

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.serviceType + ' with Vikas')}&dates=${formatGCalDate(startDateTime)}Z/${formatGCalDate(endDateTime)}Z&details=${encodeURIComponent(booking.notes || 'Advisory session scheduled via Book Vikas.')}&location=Google+Meet+Link+Sent+Separately&sf=true&output=xml`;

  // Construct client-side ICS attachment
  const createIcsDownload = () => {
    const cleanDate = booking.appointmentDate.replace(/-/g, '');
    const cleanTime = booking.appointmentTime.replace(/:/g, '');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Book Vikas//Scheduling System//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${booking.serviceType} with Vikas`,
      `DTSTART:${cleanDate}T${cleanTime}00`,
      'DURATION:PT45M',
      `DESCRIPTION:${booking.notes || 'Scheduled appointment. Google Meet details to follow.'}`,
      'LOCATION:Virtual VC / Google Meet',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Vikas_Advisory_${cleanDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 animate-slide-up">
      
      {/* Confirmation Card */}
      <div className="bg-[#111113] rounded-[32px] border border-white/10 p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Hero Success Alert */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner border border-gold/20">
            <CheckCircle2 className="h-10 w-10 animate-pulse text-gold" />
          </div>
          <span className="text-xs font-bold text-gold uppercase tracking-widest block bg-gold/15 px-3 py-1 rounded-full w-fit mx-auto border border-gold/10">
            Booking Confirmed
          </span>
          <h2 className="text-3xl font-extralight text-white font-display">You're on the books!</h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            Vikas has received your advising proposal. Confirmation email sent successfully. Details have been cataloged beneath.
          </p>
        </div>

        {/* Booking Details Pane */}
        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-white/40 uppercase tracking-widest block font-bold">Session Service</span>
              <strong className="text-gold text-lg font-display">{booking.serviceType}</strong>
            </div>

            <div className="flex gap-2 items-center text-white/70">
              <Calendar className="h-4.5 w-4.5 text-gold" />
              <span>{booking.appointmentDate} (YYYY-MM-DD)</span>
            </div>

            <div className="flex gap-2 items-center text-white/70 font-mono">
              <Clock className="h-4.5 w-4.5 text-gold" />
              <span>{booking.appointmentTime} UTC/PST</span>
            </div>
          </div>

          <div className="space-y-4 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-6">
            <div>
              <span className="text-xs text-white/40 uppercase tracking-widest block font-bold">Customer Profile</span>
              <strong className="text-white text-base">{booking.customerName}</strong>
              <span className="block text-xs text-white/40 mt-0.5">{booking.email}</span>
              <span className="block text-xs text-white/40">{booking.phone}</span>
            </div>

            {booking.notes && (
              <div>
                <span className="text-xs text-white/40 uppercase tracking-widest block font-bold">Session Brief</span>
                <p className="text-xs text-white/50 italic mt-0.5 max-w-xs truncate">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Integration Actions */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-xs text-white/40 uppercase tracking-wider">Google Calendar & Export Sync</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Add to Google Calendar */}
            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/10 text-white/80 hover:bg-white/5 hover:text-gold hover:border-gold/30 transition-all font-bold text-xs shadow-sm uppercase tracking-widest"
            >
              <ExternalLink className="h-4 w-4" />
              Add to Google Calendar
            </a>

            {/* Download Calendar File */}
            <button
              onClick={createIcsDownload}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/10 text-white/80 hover:bg-white/5 hover:text-gold hover:border-gold/30 transition-all font-bold text-xs shadow-sm uppercase tracking-widest"
            >
              <Download className="h-4 w-4" />
              Download ICS File
            </button>
          </div>
        </div>

        {/* Diagnostic Logs (if simulated output is available) */}
        {emailAlerts && (
          <div className="p-5 rounded-2xl bg-black/40 text-white/80 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gold font-mono tracking-wider">🔬 SANDBOX NOTIFICATION DECK</span>
              <span className="text-[10px] bg-gold/15 text-gold px-2.5 py-0.5 rounded-full font-mono font-bold">
                {emailAlerts.usingRealSMTP ? 'REAL SMTP COMM' : 'SIMULATION MODE'}
              </span>
            </div>

            <p className="text-xs text-white/40 leading-relaxed font-sans">
              Below are the generated email templates sent to you and Vikas. You can review the styled layout parameters of the notification triggers as if they delivered dynamically to your actual inbox!
            </p>

            {/* Collapsed panels showing the actual emails */}
            <div className="space-y-3">
              <div className="border border-white/5 rounded-xl overflow-hidden bg-white/5">
                <div className="p-3 bg-white/5 text-xs text-white font-bold border-b border-white/5 flex justify-between">
                  <span>📩 Precomposed Client Confirmation Email (delivered to {booking.email})</span>
                  <span className="text-gold font-mono text-[9px]">READY</span>
                </div>
                <div className="p-4 overflow-x-auto max-h-48 text-xs font-mono text-slate-300 bg-black/20">
                  <div dangerouslySetInnerHTML={{ __html: emailAlerts.customerPreview || '' }} style={{ color: 'initial' }} className="rounded bg-white p-4" />
                </div>
              </div>

              <div className="border border-white/5 rounded-xl overflow-hidden bg-white/5">
                <div className="p-3 bg-white/5 text-xs text-white font-bold border-b border-white/5 flex justify-between">
                  <span>🔔 Precomposed Admin Notification Email (delivered to Vikas)</span>
                  <span className="text-gold font-mono text-[9px]">NOTIFIED</span>
                </div>
                <div className="p-4 overflow-x-auto max-h-48 text-xs font-mono text-slate-300 bg-black/20">
                  <div dangerouslySetInnerHTML={{ __html: emailAlerts.adminPreview || '' }} style={{ color: 'initial' }} className="rounded bg-white p-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-center">
          <button
            onClick={onReset}
            className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-gold transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Book Another Session
          </button>
        </div>

      </div>
    </div>
  );
}
