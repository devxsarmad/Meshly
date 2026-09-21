'use client';

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FormEvent, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { notify } from '../../../lib/toast';

export function PaymentForm({ onSubmitted }: { onSubmitted: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error: submitError } = await elements.submit();
    if (submitError) { notify('error', submitError.message || 'Please check your payment details.'); setSubmitting(false); return; }
    const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/checkout` }, redirect: 'if_required' });
    if (error) { notify('error', error.message || 'Payment could not be completed.'); setSubmitting(false); return; }
    notify('success', 'Payment submitted. Waiting for confirmation.');
    onSubmitted();
  }

  return <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-6"><PaymentElement options={{ layout: 'tabs' }} /><Button type="submit" className="w-full" disabled={!stripe || !elements || submitting}>{submitting ? 'Processing payment…' : 'Pay securely'}</Button></form>;
}
