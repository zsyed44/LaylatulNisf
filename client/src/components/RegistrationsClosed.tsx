export default function RegistrationsClosed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-xl border-2 border-emerald-700 p-8 md:p-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="font-serif text-4xl font-bold text-neutral-900 mb-4">
              Registrations are Closed
            </h1>
            <p className="text-lg text-neutral-600">
              Thank you for your interest in Laylatul Nisf. Registration for this event has closed at this time.
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              If you have any questions, please contact the event organizers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

