import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is the refund policy?',
    answer: 'Full refunds are available up to 10 days before the event (January 20th). After that, refunds are available only in case of emergency or if the event is cancelled. Please contact us at least 48 hours before the event for refund requests.',
  },
  {
    question: 'What is the dress code?',
    answer: 'We request modest, respectful attire appropriate for a spiritual gathering. Formal attire is highly encouraged, however traditional wear is also welcome. Please avoid overly casual clothing.',
  },
  {
    question: 'Is parking available?',
    answer: 'Yes, free parking is available at the venue. Additional street parking is also available nearby. We recommend arriving a few minutes early to secure parking.',
  },
  {
    question: 'How do I receive my tickets?',
    answer: 'No physical tickets are required—we will check you in by name at the door. Please save your registration confirmation page for your records.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 px-4 bg-neutral-50 geometric-pattern">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-4xl font-bold text-center mb-12 text-neutral-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <span className="font-semibold text-neutral-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-emerald-700 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
                  <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

