'use server';

import { Booking } from '@/database/booking.model';
import { Event } from '@/database/event.model';
import connectDB from "@/lib/mongodb";
import { isValidObjectId } from "mongoose";

type CreateBookingInput = {
    eventId: string;
    email: string;
};

type CreateBookingResult =
    | { success: true }
    | { success: false; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isDuplicateKeyError = (error: unknown): error is { code: number } =>
    typeof error === "object" && error !== null && "code" in error && error.code === 11000;

export const createBooking = async ({
    eventId,
    email,
}: CreateBookingInput): Promise<CreateBookingResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidObjectId(eventId)) {
        return { success: false, message: "This event is invalid." };
    }

    if (
        !normalizedEmail ||
        normalizedEmail.length > 254 ||
        !emailPattern.test(normalizedEmail)
    ) {
        return { success: false, message: "Enter a valid email address." };
    }

    try {
        await connectDB();

        const eventExists = await Event.exists({ _id: eventId });

        if (!eventExists) {
            return { success: false, message: "This event no longer exists." };
        }

        const existingBooking = await Booking.exists({
            eventId,
            email: normalizedEmail,
        });

        if (existingBooking) {
            return { success: false, message: "This email is already booked for the event." };
        }

        await Booking.create({ eventId, email: normalizedEmail });

        return { success: true };
    } catch (error: unknown) {
        if (isDuplicateKeyError(error)) {
            return { success: false, message: "This email is already booked for the event." };
        }

        console.error('Create booking failed:', error);
        return { success: false, message: "Unable to create the booking right now." };
    }
};

export const getBookingCount = async (eventId: string): Promise<number> => {
    if (!isValidObjectId(eventId)) return 0;

    try {
        await connectDB();
        return await Booking.countDocuments({ eventId });
    } catch (error: unknown) {
        console.error("Get booking count failed:", error);
        return 0;
    }
};
