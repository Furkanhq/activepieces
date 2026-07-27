/**
 * Where the FlowLogic Portal lives.
 *
 * Customers sign in once at the Portal and are handed into their engine already
 * authenticated, so the engine needs to know that origin in two places: to redeem a
 * launch ticket, and to point a stranded user back home.
 *
 * This is a compile-time constant on purpose. It is deliberately NOT read from the
 * query string — that would let anyone repoint /authenticate at their own redeem
 * endpoint and harvest sessions. A server flag was also rejected: it would mean
 * editing three core files (the ApFlagId enum, flag.service, system-props) to carry a
 * value that never varies per deployment. The env override exists only so a local dev
 * build can target a localhost Portal.
 */
export const PORTAL_ORIGIN: string =
  import.meta.env.VITE_FLOWLOGIC_PORTAL_URL ?? 'https://learnflowlogic.com';

/** The Portal page that owns engine access. */
export const PORTAL_ENGINE_URL = `${PORTAL_ORIGIN}/engine`;
