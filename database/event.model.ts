import { model, models, Schema, type Model } from "mongoose";

export interface EventDocument {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const requiredText = {
  type: String,
  required: true,
  trim: true,
} as const;

const nonEmptyStringList = {
  type: [{ type: String, trim: true }],
  required: true,
  validate: {
    validator: (values: string[]) =>
      values.length > 0 && values.every((value) => value.length > 0),
    message: "{PATH} must contain at least one non-empty value.",
  },
} as const;

const eventSchema = new Schema<EventDocument>(
  {
    title: requiredText,
    slug: { type: String, required: true, trim: true },
    description: requiredText,
    overview: requiredText,
    image: requiredText,
    venue: requiredText,
    location: requiredText,
    date: requiredText,
    time: requiredText,
    mode: requiredText,
    audience: requiredText,
    agenda: nonEmptyStringList,
    organizer: requiredText,
    tags: nonEmptyStringList,
  },
  { timestamps: true },
);

// Convert titles into stable, URL-safe identifiers.
function createSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Store time consistently as a 24-hour HH:mm value.
function normalizeTime(value: string): string {
  const match = value
    .trim()
    .match(/^(0?\d|1[0-2]):([0-5]\d)\s*([ap]m)$/i);
  const twentyFourHourMatch = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

  if (twentyFourHourMatch) {
    return `${twentyFourHourMatch[1].padStart(2, "0")}:${twentyFourHourMatch[2]}`;
  }

  if (!match) {
    throw new Error("Event time must use HH:mm or h:mm AM/PM format.");
  }

  let hours = Number(match[1]) % 12;
  if (match[3].toLowerCase() === "pm") hours += 12;

  return `${hours.toString().padStart(2, "0")}:${match[2]}`;
}

eventSchema.pre("save", function () {
  const requiredValues = [
    this.title,
    this.description,
    this.overview,
    this.image,
    this.venue,
    this.location,
    this.date,
    this.time,
    this.mode,
    this.audience,
    this.organizer,
  ];

  // Guard against values containing only whitespace before normalization.
  if (requiredValues.some((value) => !value.trim())) {
    throw new Error("All required Event fields must contain a value.");
  }

  if (this.isModified("title") || !this.slug) {
    this.slug = createSlug(this.title);
    if (!this.slug) throw new Error("Event title must produce a valid slug.");
  }

  // Normalize valid dates to an unambiguous ISO-8601 representation.
  const parsedDate = new Date(this.date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Event date must be a valid date.");
  }

  this.date = parsedDate.toISOString();
  this.time = normalizeTime(this.time);
});

eventSchema.index({ slug: 1 }, { unique: true });

export const Event =
  (models.Event as Model<EventDocument> | undefined) ??
  model<EventDocument>("Event", eventSchema);
