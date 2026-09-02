import { Event, type IEvent } from '@/database/event.model';
import connectDB from "@/lib/mongodb";
import { cacheLife } from "next/cache";

export type SimilarEvent = Pick<
    IEvent,
    "title" | "image" | "slug" | "location" | "date" | "time"
>;

export const getSimilarEventsBySlug = async (slug: string): Promise<SimilarEvent[]> => {
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
            .select({
                _id: 0,
                title: 1,
                image: 1,
                slug: 1,
                location: 1,
                date: 1,
                time: 1,
            })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean<SimilarEvent[]>()
            .exec();
    } catch (error: unknown) {
        console.error("Failed to fetch similar events:", error);
        return [];
    }
};
