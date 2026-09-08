import { Event, type IEvent } from '@/database/event.model';
import connectDB from "@/lib/mongodb";
import { cacheLife } from "next/cache";

export type EventPreview = Pick<
    IEvent,
    "title" | "image" | "slug" | "location" | "date" | "time"
>;

export type EventDetail = Omit<IEvent, "createdAt" | "updatedAt"> & { _id: string };

// Fields needed to render an EventCard preview.
const EVENT_PREVIEW_PROJECTION = {
    _id: 0,
    title: 1,
    image: 1,
    slug: 1,
    location: 1,
    date: 1,
    time: 1,
} as const;

export const getAllEvents = async (): Promise<EventPreview[]> => {
    'use cache';
    cacheLife('hours');

    try {
        await connectDB();
        return await Event.find()
            .select(EVENT_PREVIEW_PROJECTION)
            .sort({ createdAt: -1 })
            .lean<EventPreview[]>()
            .exec();
    } catch (error: unknown) {
        console.error("Failed to fetch events:", error);
        return [];
    }
};

export const getEventBySlug = async (slug: string): Promise<EventDetail | null> => {
    'use cache';
    cacheLife('hours');

    try {
        await connectDB();
        const event = await Event.findOne({ slug })
            .select({ createdAt: 0, updatedAt: 0, __v: 0 })
            .lean<(EventDetail & { _id: unknown }) | null>()
            .exec();

        if (!event) return null;

        // Serialize _id so the result is safe to cache and pass to Client Components.
        return { ...event, _id: String(event._id) };
    } catch (error: unknown) {
        console.error("Failed to fetch event by slug:", error);
        return null;
    }
};

export const getSimilarEventsBySlug = async (slug: string): Promise<EventPreview[]> => {
    'use cache';
    cacheLife('hours');

    try {
        await connectDB();
        const event = await Event.findOne({ slug })
            .select({ _id: 1, tags: 1 })
            .lean<{ _id: unknown; tags: string[] }>()
            .exec();

        if (!event || !Array.isArray(event.tags) || event.tags.length === 0) return [];

        return await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags },
        })
            .select(EVENT_PREVIEW_PROJECTION)
            .sort({ createdAt: -1 })
            .limit(4)
            .lean<EventPreview[]>()
            .exec();
    } catch (error: unknown) {
        console.error("Failed to fetch similar events:", error);
        return [];
    }
};
