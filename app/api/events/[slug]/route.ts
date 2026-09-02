import { Event, type IEvent } from "@/database";
import connectToDatabase from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{ slug?: string }>;
};

type EventResponse = IEvent & {
  _id: unknown;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { slug: rawSlug } = await params;
  const slug = rawSlug?.trim();

  if (!slug) {
    return Response.json(
      { message: "Event slug is required." },
      { status: 400 },
    );
  }

  if (slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
    return Response.json(
      { message: "Event slug must contain only lowercase letters, numbers, and single hyphens." },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();

    // A lean query returns a plain object that can be serialized directly.
    const event = await Event.findOne({ slug }).lean<EventResponse>().exec();

    if (!event) {
      return Response.json(
        { message: `Event with slug "${slug}" was not found.` },
        { status: 404 },
      );
    }

    return Response.json({ event }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch event by slug:", error);

    return Response.json(
      { message: "Unable to fetch the event at this time." },
      { status: 500 },
    );
  }
}
