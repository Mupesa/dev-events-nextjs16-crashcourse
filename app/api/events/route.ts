import { Event, type IEvent } from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

type EventInput = Omit<IEvent, "slug" | "image" | "createdAt" | "updatedAt">;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function parseStringArray(value: FormDataEntryValue | null): string[] | null {
    if (typeof value !== "string") return null;

    try {
        const parsed: unknown = JSON.parse(value);

        if (
            !Array.isArray(parsed) ||
            parsed.length === 0 ||
            !parsed.every((item) => typeof item === "string" && item.trim())
        ) {
            return null;
        }

        return parsed.map((item) => item.trim());
    } catch {
        return null;
    }
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
    return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function uploadImage(buffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                { resource_type: "image", folder: "DevEvent" },
                (error, result) => {
                    if (error || !result) {
                        reject(error ?? new Error("Cloudinary returned no upload result."));
                        return;
                    }

                    resolve(result);
                },
            )
            .end(buffer);
    });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    let formData: FormData;

    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ message: "Invalid multipart form data." }, { status: 400 });
    }

    const image = formData.get("image");
    const tags = parseStringArray(formData.get("tags"));
    const agenda = parseStringArray(formData.get("agenda"));

    if (!(image instanceof File) || !image.type.startsWith("image/") || image.size === 0) {
        return NextResponse.json({ message: "A valid image file is required." }, { status: 400 });
    }

    if (image.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ message: "Image size must not exceed 10 MB." }, { status: 400 });
    }

    if (!tags || !agenda) {
        return NextResponse.json(
            { message: "Tags and agenda must be non-empty arrays of strings." },
            { status: 400 },
        );
    }

    const textFields = {
        title: formData.get("title"),
        description: formData.get("description"),
        overview: formData.get("overview"),
        venue: formData.get("venue"),
        location: formData.get("location"),
        date: formData.get("date"),
        time: formData.get("time"),
        mode: formData.get("mode"),
        audience: formData.get("audience"),
        organizer: formData.get("organizer"),
    };

    if (Object.values(textFields).some((value) => typeof value !== "string" || !value.trim())) {
        return NextResponse.json({ message: "All event fields are required." }, { status: 400 });
    }

    const eventInput: EventInput = {
        title: String(textFields.title).trim(),
        description: String(textFields.description).trim(),
        overview: String(textFields.overview).trim(),
        venue: String(textFields.venue).trim(),
        location: String(textFields.location).trim(),
        date: String(textFields.date).trim(),
        time: String(textFields.time).trim(),
        mode: String(textFields.mode).trim(),
        audience: String(textFields.audience).trim(),
        organizer: String(textFields.organizer).trim(),
        tags,
        agenda,
    };

    try {
        await connectDB();

        // Validate event fields before creating a remote asset.
        const event = new Event({ ...eventInput, image: "pending-upload" });

        try {
            await event.validate();
        } catch {
            return NextResponse.json({ message: "Invalid event data." }, { status: 400 });
        }

        const upload = await uploadImage(Buffer.from(await image.arrayBuffer()));
        event.image = upload.secure_url;

        try {
            await event.save();
        } catch (error: unknown) {
            try {
                await cloudinary.uploader.destroy(upload.public_id, { resource_type: "image" });
            } catch (cleanupError: unknown) {
                console.error("Failed to remove unused Cloudinary image:", cleanupError);
            }

            if (isDuplicateKeyError(error)) {
                return NextResponse.json(
                    { message: "An event with this title already exists." },
                    { status: 409 },
                );
            }

            console.error("Event persistence failed:", error);
            return NextResponse.json({ message: "Event creation failed." }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Event successfully created.", event },
            { status: 201 },
        );
    } catch (error: unknown) {
        console.error("Event creation failed:", error);
        return NextResponse.json({ message: "Event creation failed." }, { status: 500 });
    }
}

export async function GET(): Promise<NextResponse> {
    try {
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 }).lean().exec();

        return NextResponse.json({ message: "Events fetched successfully.", events });
    } catch (error: unknown) {
        console.error("Event fetching failed:", error);
        return NextResponse.json({ message: "Event fetching failed." }, { status: 500 });
    }
}
