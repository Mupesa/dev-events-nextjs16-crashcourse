'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";
import { formatEventDate } from "@/lib/utils";
import { FALLBACK_EVENT_IMAGE, resolveEventImage } from "@/lib/images";

interface Props {
    title: string;
    image: string;
    slug:string;
    location: string;
    date: string;
    time: string;

}

const EventCard = ({ title, image,slug,location,date,time}: Props) => {
    const displayDate = formatEventDate(date);
    // Start from a renderable src, then fall back again if the poster fails to load.
    const [posterSrc, setPosterSrc] = useState(() => resolveEventImage(image));

    const handleClick = () => {
        posthog.capture('event_card_clicked', {
            event_slug: slug,
            event_location: location,
            event_date: date,
        });
    };

    return (
        <Link href={`/event/${slug}`} className="event-card" onClick={handleClick}>
            <Image
                src={posterSrc}
                alt={title}
                width={410}
                height={300}
                className="poster"
                onError={() => setPosterSrc(FALLBACK_EVENT_IMAGE)}
            />

            <div className="flex flex-row gap-2">
                <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
                <p>{location}</p>
            </div>
            <p className="title">{title}</p>

            <div className="datetime">
                <div>
                <Image src="/icons/calendar.svg" alt="location" width={14} height={14} />
                <p>{displayDate}</p>
                </div>
                <Image src="/icons/clock.svg" alt="location" width={14} height={14} />
                <p>{time}</p>
                </div>


        </Link>
    )
}

export default EventCard
