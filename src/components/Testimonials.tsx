import { Star, Mail, MapPin, Phone, Linkedin, Twitter, AlertTriangle } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      author: 'Aarav Mehta',
      role: 'Founder, TechVarta AI (Bengaluru)',
      quote: 'Vikas restructured our backend scalability in just one advisory session. He showed us how to eliminate a ₹3,30,000/mo server overhead by optimizing our database indexing and microservices layout. Unbelievable return on investment!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150'
    },
    {
      id: 2,
      author: 'Rajesh Kumar',
      role: 'Staff Solutions Architect (Mumbai)',
      quote: 'I booked a career consultation with Vikas to refine my system architecture knowledge. His depth of knowledge on event-driven state modeling and modular micro-frontends gave me the confidence to secure my lead promotion. He is a premier mentor.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150'
    },
    {
      id: 3,
      author: 'Priyanka Sharma',
      role: 'VP of Engineering, IndiCloud (Pune)',
      quote: 'Excellent technical auditing! Vikas completed a thorough review of our cloud security layers and helped us configure correct IAM scopes. If you want pragmatic, code-level execution guidelines, look no further.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150'
    }
  ];

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extralight text-slate-950 dark:text-white tracking-widest uppercase font-display">
            Recent Client <span className="font-serif italic text-gold font-normal lowercase">success</span> stories
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-white/40">
            Hear from startup founders, staff developers, and technical leaders who have scaled their platforms with Vikas.
          </p>
        </div>

        {/* Quotes list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between p-8 bg-slate-50 dark:bg-[#111113] rounded-[32px] border border-slate-250 dark:border-white/10 relative shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6 text-gold">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-750 dark:text-white/70 text-sm sm:text-base italic leading-relaxed flex-grow font-serif">
                "{rev.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-150 dark:border-white/5">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-white/10"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">{rev.author}</h4>
                  <p className="text-xs text-gold">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact info pane / Details */}
        <div id="contact" className="mt-20 p-8 sm:p-12 rounded-[32px] bg-slate-900 dark:bg-[#111113] text-white relative overflow-hidden border border-slate-850 dark:border-white/5 shadow-2xl">
          {/* Subtle flare in matching luxury gold */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Context */}
            <div className="lg:col-span-7 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-extralight tracking-widest uppercase font-display text-white">
                Custom <span className="font-serif italic font-normal text-gold lowercase">enterprise</span> assistance
              </h3>
              <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                Have an RFP, multi-week software audit demand, or custom startup boot camp request? Reach out to Vikas directly. We respond within 12 hours.
              </p>

              <div className="space-y-4 pt-4 text-sm text-white/70 font-mono">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4.5 w-4.5 text-gold" />
                  <a href="mailto:vikasgowdas@gmai.com" className="hover:text-gold transition-colors text-white/80">vikasgowdas@gmai.com</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4.5 w-4.5 text-gold" />
                  <span className="text-white/80">+91 98450 12345</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-gold" />
                  <span className="text-white/80 font-sans">Near junior collage Bangarpet Kolar (D)</span>
                </div>
              </div>

              {/* Socials */}
              <div className="flex gap-4 pt-4">
                <a href="#" className="h-10 w-10 rounded-full bg-white/5 hover:bg-gold/15 flex items-center justify-center transition-all border border-white/10 group">
                  <Linkedin className="h-4.5 w-4.5 text-gold group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-white/5 hover:bg-gold/15 flex items-center justify-center transition-all border border-white/10 group">
                  <Twitter className="h-4.5 w-4.5 text-gold group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* SMTP alert panel styled beautifully */}
            <div className="lg:col-span-5 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 relative">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-gold/10 text-gold h-fit">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-white font-display uppercase tracking-widest">Notification Engine Active</h4>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Email notifications are fully integrated. In development, booking triggers automatically fallback to generating a live booking notification record inside the scheduling success dashboard, keeping local databases clean.
                  </p>
                  <p className="text-[10px] text-gold font-mono uppercase tracking-tight">
                    Prod environment supports customizable SMTP credentials.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
