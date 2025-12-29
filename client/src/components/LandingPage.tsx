import { useEffect, useRef, useState } from 'react';

interface LandingPageProps {
  onRegister: () => void;
}

export default function LandingPage({ onRegister }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({
    details: false,
    leftCard: false,
    rightCard: false,
  });
  const heroRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === detailsRef.current) {
            setIsVisible((prev) => ({ ...prev, details: true }));
          } else if (entry.target === leftCardRef.current) {
            setIsVisible((prev) => ({ ...prev, leftCard: true }));
          } else if (entry.target === rightCardRef.current) {
            setIsVisible((prev) => ({ ...prev, rightCard: true }));
          }
        }
      });
    }, observerOptions);

    if (detailsRef.current) observer.observe(detailsRef.current);
    if (leftCardRef.current) observer.observe(leftCardRef.current);
    if (rightCardRef.current) observer.observe(rightCardRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-emerald-50/30 to-neutral-50 overflow-x-hidden">
      {/* Logo in top corner */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 md:w-16 md:h-16">
        <img 
          src="/logo.png" 
          alt="Laylatul Nisf" 
          className="w-full h-full object-contain drop-shadow-lg opacity-90 hover:opacity-100 transition-opacity rounded-lg"
        />
      </div>

      {/* Register Button - Fixed in corner */}
      <button
        onClick={onRegister}
        className="fixed top-4 left-4 md:top-6 md:left-6 z-50 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-emerald-800 hover:to-emerald-900 transition-all duration-300 font-semibold text-xs md:text-base backdrop-blur-sm"
      >
        Register
      </button>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-24 pt-20 pb-12 md:pt-24 md:pb-20"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          opacity: 1 - scrollY / 800,
          overflow: 'visible',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-gold-900/10"></div>
        <div className="relative z-10 w-full max-w-7xl mx-auto text-center px-2 sm:px-4 md:px-12 lg:px-24" style={{ overflow: 'visible' }}>
          <div style={{ overflow: 'visible', padding: '0.5rem 0 3rem 0' }} className="md:py-4 md:pb-12">
            <h1 className="fleur-de-leah-regular text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl md:whitespace-nowrap" style={{ overflow: 'visible', margin: '0.5rem 0 2rem 0', lineHeight: '1.4', paddingBottom: '1.5rem' }}>
              <span className="animated-gradient inline-block px-2 sm:px-4 md:px-8 lg:px-12" style={{ overflow: 'visible', display: 'inline-block' }}>
                Laylatul Nisf
              </span>
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 mb-3 md:mb-4 font-light mt-1 md:mt-2 px-2">
            Celebrating the 15th of Sha'ban
          </p>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent mx-auto mb-6 md:mb-8"></div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-700 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Join us for a beautiful evening celebrating the birth of the 12th Imam, Imam Mahdi (AS). There will be food, games, and activities, for a night filled with spirituality, and fun.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-neutral-600 px-4">
            <div className="flex items-center gap-2 md:gap-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-sm sm:text-base">Friday, January 30, 2025</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gold-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-sm sm:text-base">4:45 PM - 10:00 PM</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-sm sm:text-base text-center">L'Azzurra Banquet Hall, Vaughan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section 
        ref={detailsRef}
        className="py-20 px-4 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div 
            ref={detailsRef}
            className={`text-center mb-16 transition-all duration-1000 ease-out ${
              isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              About the Event
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
              This special banquet brings our community together to honor this significant occasion in the Shia tradition. 
              It provides a wonderful opportunity to socialize with other Shia students & community members. 
              There will be food, games, and a chance to win prizes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {/* What's Included */}
            <div 
              ref={leftCardRef}
              className={`bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-8 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-700 ease-out ${
                isVisible.leftCard ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              <h3 className="font-serif text-2xl font-bold mb-6 text-emerald-800">What's Included</h3>
              <ul className="space-y-4 text-neutral-700">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1.5 text-xl">•</span>
                  <span className="text-base">Traditional dinner and drink service</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-600 mt-1.5 text-xl">•</span>
                  <span className="text-base">Spiritual program and recitations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1.5 text-xl">•</span>
                  <span className="text-base">Community games, activities, and raffles</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-600 mt-1.5 text-xl">•</span>
                  <span className="text-base">Photo booth and other amenities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1.5 text-xl">•</span>
                  <span className="text-base">Prayer facilities and spiritual guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-600 mt-1.5 text-xl">•</span>
                  <span className="text-base">Networking opportunities with community members</span>
                </li>
              </ul>
            </div>

            {/* Event Schedule */}
            <div 
              ref={rightCardRef}
              className={`bg-gradient-to-br from-gold-50 to-gold-100/50 p-8 rounded-2xl border border-gold-200 shadow-sm hover:shadow-md transition-all duration-700 ease-out ${
                isVisible.rightCard ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <h3 className="font-serif text-2xl font-bold mb-6 text-gold-800">Event Schedule</h3>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <div>
                    <div className="font-semibold"><strong>4:45 PM</strong> - Doors Open</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Check-in & seating</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Doors close at 6:45</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">•</span>
                  <div>
                    <div className="font-semibold"><strong>5:00 PM</strong> - Opening & Welcome</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Quran, Hadith e Kisa, Event Welcome</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <div>
                    <div className="font-semibold"><strong>5:30 PM</strong> - Salah</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">•</span>
                  <div>
                    <div className="font-semibold"><strong>6:00 PM</strong> - Speech & Nasheeds</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Registration doors close</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <div>
                    <div className="font-semibold"><strong>7:00 PM</strong> - Games, Activities, Raffle</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Photobooth and drink station opens</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">•</span>
                  <div>
                    <div className="font-semibold"><strong>9:00 PM</strong> - Dinner & Open Social</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Buffet opens</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <div>
                    <div className="font-semibold"><strong>10:00 PM</strong> - Event Concludes</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Secure your spot for this special evening. Tickets are $60 CAD per person.
          </p>
          <button
            onClick={onRegister}
            className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-900 rounded-lg shadow-xl hover:shadow-2xl hover:from-gold-400 hover:to-gold-500 transition-all duration-300 font-bold text-lg"
          >
            Register Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© 2025 Laylatul Nisf Event. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

