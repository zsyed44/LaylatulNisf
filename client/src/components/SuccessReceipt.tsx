import type { Registration } from '../types';

interface SuccessReceiptProps {
  registration: Registration;
}

export default function SuccessReceipt({ registration }: SuccessReceiptProps) {
  const ticketPrice = 45;
  const total = registration.qty * ticketPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl border-2 border-emerald-700 p-8 md:p-12 text-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="font-serif text-4xl font-bold text-neutral-900 mb-2">
              You're Registered!
            </h1>
            <p className="text-neutral-600">
              Thank you for registering for Laylatul Nisf
            </p>
          </div>

          <div className="border-t border-b border-neutral-200 py-6 my-6">
            <div className="text-left space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">Registration ID</span>
                <span className="font-semibold text-neutral-900">#{registration.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Name</span>
                <span className="font-semibold text-neutral-900">{registration.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Email</span>
                <span className="font-semibold text-neutral-900">{registration.email}</span>
              </div>
              {registration.phone && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Phone</span>
                  <span className="font-semibold text-neutral-900">{registration.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Tickets</span>
                <span className="font-semibold text-neutral-900">{registration.qty}</span>
              </div>
              {registration.dietary && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Dietary Restrictions</span>
                  <span className="font-semibold text-neutral-900">{registration.dietary}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gold-50 to-emerald-50 border-2 border-emerald-300 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-700">Subtotal</span>
              <span className="font-semibold">${total.toFixed(2)} CAD</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-emerald-300">
              <span className="text-lg font-semibold text-neutral-900">Total Paid</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-gold-700 to-emerald-700 bg-clip-text text-transparent">${total.toFixed(2)} CAD</span>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-lg p-4 text-sm text-neutral-600">
            <p>
              <strong>Status:</strong>{' '}
              <span className={`font-semibold ${
                registration.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {registration.status === 'paid' ? 'Paid' : 'Pending Payment'}
              </span>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-neutral-600 mb-4">
              We look forward to seeing you on <strong>Friday, January 30, 4:45 PM</strong>
            </p>
            <p className="text-sm text-neutral-500 mb-2">
              Please keep a screenshot of this confirmation handy for your own personal reference.
            </p>
            <p className="text-sm text-neutral-500">
              If you have any questions, please contact the event organizers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

