import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { getAllEvents } from "@/lib/actions/event.actions";
import { cacheLife } from "next/cache";

const Page = async () => {
    'use cache';
    cacheLife('hours')

    const events = await getAllEvents();

  return (
      <section>
        <h1 className="text-center">The hub for every Dev <br/>event you cannot miss</h1>
        <p className="text-center mt-5">Hackathons, Meetups, and Conferences , All in One place</p>
        <ExploreBtn/>

          <div className="mt-20 space-y-7">
              <h3>Featured Events</h3>

              <ul className="events">
                  {events.map((event) => (
                      <li key={event.slug}>
                          <EventCard {...event} />
                      </li>
                  ))}
              </ul>
          </div>
      </section>
  )
};

export default Page;
