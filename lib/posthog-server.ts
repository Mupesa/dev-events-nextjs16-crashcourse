import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, " +
          "this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
      );
    }
    // In production, return a no-op stub so the app doesn't crash
    return {
      capture: () => {},
      identify: () => {},
      flush: async () => {},
      shutdown: async () => {},
    } as unknown as PostHog;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(token, {
      host: host,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}
