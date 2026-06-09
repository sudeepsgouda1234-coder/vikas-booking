import { CalendarRange, ShieldCheck, Zap, Award, Star } from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
}

export default function Hero({ onBookClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 transition-colors duration-300 bg-transparent">
      {/* Elegantly warm glow blobs instead of bright blue */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold/10 dark:bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-dark/10 dark:bg-[#8a6e3c]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          {/* Text Content column */}
          <div className="space-y-8 lg:col-span-7">
            <div className="space-y-4">
              <h2 className="text-gold font-serif italic text-2xl tracking-wide flex items-center gap-2">
                <Zap className="h-4.5 w-4.5 text-gold" style={{ filter: 'drop-shadow(0 0 5px rgba(197,160,89,0.5))' }} />
                Strategy & Execution Specialist
              </h2>

              <h1 className="text-5xl sm:text-6xl font-extralight text-slate-950 dark:text-white tracking-tight leading-[1.1] font-display">
                Scale Your Product &<br />
                <span className="font-serif italic font-normal text-gold">Master Your Stack</span> with Vikas
              </h1>

              <p className="text-base sm:text-lg text-slate-650 dark:text-white/40 max-w-2xl leading-relaxed">
                Vikas helps executive teams and individual founders scale operations through high-impact technical consulting and mentorship.
                Whether you need to iron out critical cloud scalability bottlenecks, review complex React architectures, or model MVPs,
                attain clarity to fast-track your technical growth.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onBookClick}
                className="px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-full bg-slate-950 text-white dark:bg-white dark:text-black hover:bg-gold dark:hover:bg-gold hover:text-black dark:hover:text-black shadow-lg shadow-gold/10 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <CalendarRange className="h-4 w-4" />
                Schedule Consultation
              </button>
              
              <button
                onClick={() => {
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-full border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white active:scale-[0.98] transition-all"
              >
                Browse Services
              </button>
            </div>

            {/* Grid stats structured cleanly matching prompt */}
            <div className="pt-6 border-t border-slate-200/50 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-slate-250 dark:border-white/5 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-gold mb-1 font-bold">Experience</span>
                <span className="text-lg font-light text-slate-900 dark:text-white">4 Years Exp.</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-slate-250 dark:border-white/5 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-gold mb-1 font-bold">Advising</span>
                <span className="text-lg font-light text-slate-900 dark:text-white">240+ Reviews</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-slate-250 dark:border-white/5 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-gold mb-1 font-bold">Format</span>
                <span className="text-lg font-light text-slate-900 dark:text-white">1:1 Zoom</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-slate-250 dark:border-white/5 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-gold mb-1 font-bold">Next Date</span>
                <span className="text-lg font-light text-slate-900 dark:text-white">Available Now</span>
              </div>
            </div>
          </div>

          {/* Portrait Image Block column */}
          <div className="mt-12 lg:mt-0 lg:col-span-5 flex justify-center">
            <div className="relative">
              {/* Gold gradient glow design backing */}
              <div className="absolute inset-0 bg-gradient-to-tr from-gold to-gold-dark rounded-[32px] rotate-3 scale-102 opacity-20 blur-sm" />
              
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-[32px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#111113]">
                {/* Profile photo */}
                <img
                  src="/profile.jpg"
                  alt="Vikas - Strategy Lead"
                  referrerPolicy="no-referrer"
                  className="w-full h-[550px] lg:h-[600px] object-cover object-center hover:scale-105 transition-transform duration-500"
                />
                
                {/* Luxury glass detail overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 bg-[#050505]/80 backdrop-blur-md text-white border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white font-display">Vikas</h3>
                      <p className="text-xs text-gold">Consulting Lead • 4 Years Exp.</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg text-xs font-bold text-gold border border-white/10">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      <span>4.9</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed font-serif italic">
                    "Helping executive teams and individual founders scale operations through high-impact consulting and mentorship sessions."
                  </p>
                </div>
              </div>

              {/* Gold Badge float 2 */}
              <div className="absolute -bottom-4 -left-4 p-3.5 bg-slate-900 border border-white/10 rounded-2xl shadow-xl text-xs font-bold text-gold">
                ⚡ Available Today
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
