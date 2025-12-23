export default function EventHero() {
  return (
    <div className="relative bg-gradient-to-br from-neutral-900 via-emerald-950 to-neutral-900 text-white py-20 px-4 pattern-overlay overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo placeholder - replace with your logo image */}
        {/* <img src="/logo.png" alt="Laylatul Nisf Logo" className="h-24 md:h-32 mx-auto mb-6" /> */}
        <h1 className="fleur-de-leah-regular text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] mb-4 pb-6 leading-[1.15] animated-gradient">
          Laylatul Nisf
        </h1>
        <p className="text-xl md:text-2xl text-neutral-500 mb-8 font-light">
          Celebrating the 15th of Sha'ban
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-neutral-400">
          <div className="flex items-center gap-2 text-lg md:text-xl">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Tuesday, January 30, 6:00 PM</span>
          </div>
          <div className="flex items-center gap-2 text-lg md:text-xl">
            <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Community Hall, London, ON</span>
          </div>
          <div className="flex items-center gap-2 text-lg md:text-xl">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">$60 per ticket</span>
          </div>
        </div>
      </div>
    </div>
  );
}

