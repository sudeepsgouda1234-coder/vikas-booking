import { Clock, IndianRupee, ArrowRight, Video, Code, Rocket, Coffee } from 'lucide-react';
import { Service } from '../types';

interface ServiceCardProps {
  services: Service[];
  onSelectService: (serviceName: string) => void;
}

export default function ServiceCard({ services, onSelectService }: ServiceCardProps) {
  // Map index to elegant gold indicators
  const getIcon = (id: string) => {
    switch (id) {
      case 's1':
        return <Video className="h-6 w-6 text-gold" />;
      case 's2':
        return <Code className="h-6 w-6 text-gold-light" />;
      case 's3':
        return <Rocket className="h-6 w-6 text-gold" />;
      default:
        return <Coffee className="h-6 w-6 text-gold-light" />;
    }
  };

  return (
    <section id="services" className="py-16 bg-transparent border-y border-slate-200/50 dark:border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extralight text-slate-950 dark:text-white tracking-widest uppercase font-display">
            Selected <span className="font-serif italic text-gold font-normal lowercase">consulting</span> services
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-white/40">
            Book a dedicated session tailored to solve your exact product hurdles. Every session includes custom notes, direct feedback, and access to follow-up templates.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col justify-between p-6 bg-slate-50 dark:bg-[#111113] rounded-3xl border border-slate-250 dark:border-white/10 hover:border-gold/50 dark:hover:border-gold/50 hover:shadow-[0_0_30px_rgba(197,160,89,0.15)] hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white dark:bg-white/5 rounded-2.5xl group-hover:bg-gold/10 transition-colors border border-slate-100 dark:border-white/5">
                    {getIcon(service.id)}
                  </div>
                  
                  {/* Pricing Badge */}
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center">
                    {service.price === 0 ? (
                      <span className="text-[#c5a059] text-xs uppercase tracking-widest bg-gold/15 px-3 py-1 rounded-full border border-gold/20">Free</span>
                    ) : (
                      <span className="flex items-center text-gold">
                        <IndianRupee className="h-4 w-4 text-gold/63" />
                        <span>{service.price.toLocaleString('en-IN')}</span>
                      </span>
                    )}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base sm:text-lg text-slate-950 dark:text-white/90 group-hover:text-gold transition-colors font-display">
                  {service.name}
                </h3>

                {/* Duration */}
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-white/40 font-mono">
                  <Clock className="h-3.5 w-3.5 text-gold-dark" />
                  <span>{service.duration} Minute Session</span>
                </div>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-white/50 leading-relaxed font-sans">
                  {service.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-150 dark:border-white/5">
                <button
                  onClick={() => onSelectService(service.name)}
                  className="w-full py-3 px-4 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-gold dark:hover:bg-gold hover:text-black dark:hover:text-black font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  Select & Book
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
