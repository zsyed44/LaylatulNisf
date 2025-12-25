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
            <div className="bg-neutral-50 p-6 rounded-lg border border-emerald-200">
              <h3 className="font-semibold text-xl mb-3 text-emerald-800">What's Included</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Traditional dinner and drink service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-1">•</span>
                  <span>Spiritual program and recitations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Community games, activities, and raffles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-1">•</span>
                  <span>Photo booth and other ammenities</span>
                </li>
              </ul>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg border border-gold-200">
              <h3 className="font-semibold text-xl mb-3 text-gold-700">Event Schedule</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span><strong>6:00 PM</strong> - Doors open & welcome</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-1">•</span>
                  <span><strong>7:00 PM</strong> - Program begins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span><strong>8:00 PM</strong> - Dinner service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-1">•</span>
                  <span><strong>9:30 PM</strong> - Closing remarks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

