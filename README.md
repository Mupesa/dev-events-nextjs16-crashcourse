This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. |
| `CLOUDINARY_URL` | Cloudinary credentials used to upload event images. |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog project token for analytics and error tracking. |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL. |

> **Comment syntax:** `.env` files treat only lines that start with `#` as comments. `//` is **not** a comment marker, so text like `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com // production host` makes the value include ` // production host`. Put each comment on its own `#` line instead.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
