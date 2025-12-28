export default function EventDetails() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-4xl font-bold text-center mb-12 text-neutral-900">
          About the Event
        </h2>
        <div className="prose prose-lg max-w-none text-neutral-700 space-y-6">
          <p className="text-lg leading-relaxed">
            Join us for a beautiful evening celebrating the birth of the 12th Imam, Imam Mahdi (AS), 
            on the blessed night of the 15th of Sha'ban. This special banquet brings our community 
            together to honor this significant occasion in the Shia tradition. It also provides a good
            oppurtunity to socialize with other Shia students & community members. There will be food,
            games, and a chance to win prizes.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-neutral-50 p-8 rounded-lg border border-emerald-200">
              <h3 className="font-semibold text-2xl mb-6 text-emerald-800">What's Included</h3>
              <ul className="space-y-4 text-neutral-700 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1 text-xl">•</span>
                  <span>Traditional dinner and drink service</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-500 mt-1 text-xl">•</span>
                  <span>Spiritual program and recitations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1 text-xl">•</span>
                  <span>Community games, activities, and raffles</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-500 mt-1 text-xl">•</span>
                  <span>Photo booth and other amenities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1 text-xl">•</span>
                  <span>Prayer facilities and spiritual guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-500 mt-1 text-xl">•</span>
                  <span>Networking opportunities with community members</span>
                </li>
              </ul>
            </div>
            <div className="bg-neutral-50 p-8 rounded-lg border border-gold-200">
              <h3 className="font-semibold text-2xl mb-6 text-gold-700">Event Schedule</h3>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <div>
                    <div><strong>4:45 PM</strong> - Doors Open</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Check-in & seating</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Doors close at 6:45</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-1">•</span>
                  <div>
                    <div><strong>5:00 PM</strong> - Opening & Welcome</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Quran, Hadith e Kisa, Event Welcome</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <div>
                    <div><strong>5:30 PM</strong> - Salah</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-1">•</span>
                  <div>
                    <div><strong>6:00 PM</strong> - Speech & Nasheeds</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Registration doors close</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <div>
                    <div><strong>7:00 PM</strong> - Games, Activities, Raffle</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Photobooth and drink station opens</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-1">•</span>
                  <div>
                    <div><strong>9:00 PM</strong> - Dinner & Open Social</div>
                    <div className="text-sm text-neutral-500 mt-0.5">Buffet opens</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <div>
                    <div><strong>10:00 PM</strong> - Event Concludes</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

