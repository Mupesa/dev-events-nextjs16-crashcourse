'use client';

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.action";
import posthog from "posthog-js";
import { useRouter } from "next/navigation";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string;}) => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const result = await createBooking({ eventId, email });

            if(result.success) {
                setSubmitted(true);
                posthog.capture('event_booked', { eventId, slug });
                router.refresh();
            } else {
                setErrorMessage(result.message);
            }
        } catch (error: unknown) {
            setErrorMessage('Unable to create the booking right now.');
            posthog.captureException(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                            autoComplete="email"
                            maxLength={254}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {errorMessage && <p className="text-sm" role="alert">{errorMessage}</p>}

                    <button type="submit" className="button-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    )
}
export default BookEvent
