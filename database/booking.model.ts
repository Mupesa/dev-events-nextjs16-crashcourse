import { model, models, Schema, Types, type Model } from "mongoose";

import { Event } from "./event.model";

export interface BookingDocument {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: Event.modelName,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [emailPattern, "A valid email address is required."],
    },
  },
  { timestamps: true },
);

// Prevent bookings from referencing an Event that does not exist.
bookingSchema.pre("save", async function () {
  const eventExists = await Event.exists({ _id: this.eventId });

  if (!eventExists) {
    throw new Error("Cannot create a booking for a non-existent event.");
  }
});

// One email address can reserve only one spot per event.
bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

export const Booking =
  (models.Booking as Model<BookingDocument> | undefined) ??
  model<BookingDocument>("Booking", bookingSchema);
