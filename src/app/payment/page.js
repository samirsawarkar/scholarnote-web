'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from '../firebaseConfig';
import Navbar from '../components/Navbar';
import { IndianRupee } from 'lucide-react';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ noteId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
      return;
    }

    // Here, you would typically send the paymentMethod.id to your server
    // to create a charge or save the payment method for future use.
    // For this example, we'll simulate a successful payment.

    // Update the note's downloaderEmails array
    const user = auth.currentUser;
    if (user) {
      const noteRef = doc(db, "notes", noteId);
      await updateDoc(noteRef, {
        downloaderEmails: arrayUnion(user.email)
      });
    }

    setProcessing(false);
    router.push(`/course?id=${noteId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            className="p-4 border rounded-md"
          />
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {processing ? 'Processing...' : (
          <>
            Pay <IndianRupee size={16} className="mx-1" /> {amount}
          </>
        )}
      </button>
    </form>
  );
};

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const noteId = searchParams.get('id');
  const [noteData, setNoteData] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchNoteData = async () => {
      if (noteId) {
        const docRef = doc(db, "notes", noteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNoteData({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
          router.push('/');
        }
      }
    };

    if (user) {
      fetchNoteData();
    }
  }, [noteId, user, router]);

  if (!noteData || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment for {noteData.subject}
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>You are about to purchase access to this note.</p>
              </div>
              <div className="mt-4">
                <p className="text-md font-semibold">
                  Amount: <IndianRupee size={16} className="inline mr-1" />
                  {noteData.amount}
                </p>
              </div>
              <div className="mt-5">
                <Elements stripe={stripePromise}>
                  <PaymentForm noteId={noteData.id} amount={noteData.amount} />
                </Elements>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
