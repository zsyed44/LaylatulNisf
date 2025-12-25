import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import EventHero from './components/EventHero';
import EventDetails from './components/EventDetails';
import FAQ from './components/FAQ';
import RegistrationCard from './components/RegistrationCard';
import SuccessReceipt from './components/SuccessReceipt';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import { startCheckout, confirmCheckout, createPaymentIntent, verifyToken } from './api';
import { getStripe } from './stripe';
import type { RegistrationFormData, Registration } from './types';

type ViewState = 'form' | 'success' | 'admin' | 'login';

// Default ticket price
const TICKET_PRICE = 60;

function App() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: string;
    message: string;
    type: 'success' | 'error' | 'processing' | null;
  } | null>(null);

  useEffect(() => {
    try {
      // Check if admin page is requested
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      
      if (urlParams.get('admin') === 'true' || hash === '#admin') {
        // Check if user is already authenticated
        const token = localStorage.getItem('adminToken');
        if (token) {
          // Verify token is still valid
          verifyToken()
            .then(() => {
              setViewState('admin');
              setIsLoaded(true);
            })
            .catch((err) => {
              console.error('Token verification failed:', err);
              // Token invalid, show login
              setViewState('login');
              setIsLoaded(true);
            });
        } else {
          // No token, show login
          setViewState('login');
          setIsLoaded(true);
        }
        return;
      }

      // Trigger fade-in animation on mount
      setIsLoaded(true);
      
      // Check for payment status from redirect
      checkPaymentStatus().catch((err) => {
        console.error('Error checking payment status:', err);
      });
      
      // Fetch PaymentIntent as soon as checkout page loads
      fetchPaymentIntent(1).catch((err) => {
        console.error('Error fetching payment intent:', err);
      });
    } catch (error) {
      console.error('Error in useEffect:', error);
      setIsLoaded(true);
    }
  }, []);

  const checkPaymentStatus = async () => {
    // Check for payment_intent_client_secret in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');

    if (!paymentIntentClientSecret) {
      return; // No redirect, continue normally
    }

    // Clean up URL by removing query parameters
    window.history.replaceState({}, '', window.location.pathname);

    try {
      const stripe = await getStripe();
      if (!stripe) {
        setPaymentStatus({
          status: 'error',
          message: 'Payment system is not available. Please contact support.',
          type: 'error',
        });
        return;
      }

      // Retrieve the PaymentIntent to check its status
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);

      if (error) {
        setPaymentStatus({
          status: 'error',
          message: error.message || 'Failed to retrieve payment status.',
          type: 'error',
        });
        return;
      }

      if (!paymentIntent) {
        setPaymentStatus({
          status: 'error',
          message: 'Payment information not found.',
          type: 'error',
        });
        return;
      }

      // Determine status message based on PaymentIntent status
      switch (paymentIntent.status) {
        case 'succeeded':
          setPaymentStatus({
            status: 'succeeded',
            message: 'Payment succeeded! Your registration is being processed.',
            type: 'success',
          });
          break;
        case 'processing':
          setPaymentStatus({
            status: 'processing',
            message: 'Your payment is being processed. Please wait...',
            type: 'processing',
          });
          break;
        case 'requires_payment_method':
          setPaymentStatus({
            status: 'requires_payment_method',
            message: 'Your payment was not successful. Please try again with a different payment method.',
            type: 'error',
          });
          break;
        case 'requires_confirmation':
          setPaymentStatus({
            status: 'requires_confirmation',
            message: 'Payment requires confirmation. Please try again.',
            type: 'error',
          });
          break;
        case 'requires_action':
          setPaymentStatus({
            status: 'requires_action',
            message: 'Payment requires additional action. Please complete the authentication.',
            type: 'error',
          });
          break;
        case 'canceled':
          setPaymentStatus({
            status: 'canceled',
            message: 'Payment was canceled. Please try again if you wish to complete your registration.',
            type: 'error',
          });
          break;
        default:
          setPaymentStatus({
            status: paymentIntent.status,
            message: `Payment status: ${paymentIntent.status}. Please contact support if you have questions.`,
            type: 'error',
          });
      }
    } catch (err: any) {
      setPaymentStatus({
        status: 'error',
        message: err.message || 'An error occurred while checking payment status.',
        type: 'error',
      });
      console.error('Error checking payment status:', err);
    }
  };

  const fetchPaymentIntent = async (quantity: number) => {
    setIsCreatingPaymentIntent(true);
    setPaymentError(null);
    
    try {
      const amount = quantity * TICKET_PRICE;
      const response = await createPaymentIntent({
        amount,
        currency: 'usd',
      });
      
      setClientSecret(response.data.clientSecret);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to initialize payment';
      
      // Check if it's a Stripe configuration error
      if (errorMessage.includes('Stripe is not configured') || errorMessage.includes('STRIPE_SECRET_KEY')) {
        setPaymentError('Payment system is not configured. Please contact the administrator.');
      } else {
        setPaymentError(errorMessage);
      }
      
      console.error('Error creating PaymentIntent:', err);
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handleSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Payment has already been confirmed in RegistrationCard
      // Now create registration and mark as paid
      const checkoutResponse = await startCheckout(data);

      // Update registration status to paid (payment was already confirmed by Stripe)
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

  // Handle login
  const handleLogin = (token: string) => {
    localStorage.setItem('adminToken', token);
    setViewState('admin');
  };

  // Show login page
  if (viewState === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show admin page
  if (viewState === 'admin') {
    return <AdminPage />;
  }

  if (viewState === 'success' && registration) {
    return <SuccessReceipt registration={registration} />;
  }

  // Show loading state if not loaded yet
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get Stripe instance
  const stripePromise = getStripe();

  // Render content - always wrap in Elements provider since RegistrationCard uses Stripe hooks
  const content = (
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
              {/* Payment status message from redirect */}
              {paymentStatus && (
                <div className={`mb-4 p-4 border rounded-lg ${
                  paymentStatus.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : paymentStatus.type === 'processing'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {paymentStatus.type === 'success' && (
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {paymentStatus.type === 'processing' && (
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {paymentStatus.type === 'error' && (
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        paymentStatus.type === 'success'
                          ? 'text-green-800'
                          : paymentStatus.type === 'processing'
                          ? 'text-blue-800'
                          : 'text-red-800'
                      }`}>
                        {paymentStatus.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {isCreatingPaymentIntent && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600">Initializing payment...</p>
                </div>
              )}
              {paymentError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{paymentError}</p>
                </div>
              )}
              <RegistrationCard 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                clientSecret={clientSecret}
              />
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

  // Always wrap in Elements provider so RegistrationCard hooks work
  // When clientSecret is available, use it. Otherwise use mode: 'payment' with amount
  return (
    <Elements
      stripe={stripePromise}
      options={clientSecret ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      } : {
        // When no clientSecret yet, use mode: 'payment' with default amount
        // This allows Elements to initialize while PaymentIntent is being created
        mode: 'payment',
        amount: TICKET_PRICE * 100, // Convert to cents (default to 1 ticket)
        currency: 'usd',
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      {content}
    </Elements>
  );
}

export default App;

