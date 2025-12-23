import React, { useState, useEffect } from 'react';
import EventHero from './components/EventHero';
import EventDetails from './components/EventDetails';
import FAQ from './components/FAQ';
import RegistrationCard from './components/RegistrationCard';
import SuccessReceipt from './components/SuccessReceipt';
import { startCheckout, confirmCheckout } from './api';
import type { RegistrationFormData, Registration } from './types';

type ViewState = 'form' | 'success';

function App() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation on mount
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Start checkout (creates registration)
      const checkoutResponse = await startCheckout(data);

      // Simulate payment confirmation (in real app, this would be Stripe)
      const confirmedRegistration = await confirmCheckout(checkoutResponse.data.registrationId);

      setRegistration(confirmedRegistration);
      setViewState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (viewState === 'success' && registration) {
    return <SuccessReceipt registration={registration} />;
  }

  return (
    <div className={`min-h-screen transition-opacity duration-[2000ms] ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <EventHero />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <EventDetails />
            <FAQ />
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <RegistrationCard onSubmit={handleSubmit} isLoading={isLoading} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-neutral-900 text-neutral-300 py-8 px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© 2025 Laylatul Nisf Event. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

