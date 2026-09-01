export interface Event {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: Event[] = [
  {
    title: "ZurichJS Conference 2026",
    image: "/images/event1.png",
    slug: "zurichjs-conference-2026",
    location: "Zurich, Switzerland",
    date: "September 10–11, 2026",
    time: "All day",
  },
  {
    title: "React Alicante 2026",
    image: "/images/event2.png",
    slug: "react-alicante-2026",
    location: "Alicante, Spain",
    date: "September 24–26, 2026",
    time: "All day",
  },
  {
    title: "GitHub Universe 2026",
    image: "/images/event3.png",
    slug: "github-universe-2026",
    location: "San Francisco, California & Online",
    date: "October 28–29, 2026",
    time: "All day",
  },
  {
    title: "JSConf Mexico 2026",
    image: "/images/event4.png",
    slug: "jsconf-mexico-2026",
    location: "Mexico City, Mexico",
    date: "October 29–30, 2026",
    time: "All day",
  },
  {
    title: "KubeCon + CloudNativeCon North America 2026",
    image: "/images/event5.png",
    slug: "kubecon-cloudnativecon-north-america-2026",
    location: "Salt Lake City, Utah",
    date: "November 9–12, 2026",
    time: "All day",
  },
  {
    title: "React Summit US 2026",
    image: "/images/event6.png",
    slug: "react-summit-us-2026",
    location: "New York City, New York & Online",
    date: "November 17 & 20, 2026",
    time: "All day",
  },
];
