import { config } from '../config';

/**
 * On-demand ISR revalidation utility for Next.js frontend
 * Triggers Next.js /api/revalidate endpoint for specified paths
 *
 * @param paths Array of path strings or single path string (e.g. ['/blog', '/blog/my-slug', '/'])
 * @returns boolean indicating whether revalidation request was dispatched
 */
export const revalidateFrontend = async (paths: string[] | string): Promise<boolean> => {
  try {
    const rawPaths = Array.isArray(paths) ? paths : [paths];
    const uniquePaths = Array.from(
      new Set(
        rawPaths
          .map((p) => (typeof p === 'string' ? p.trim() : ''))
          .filter((p) => Boolean(p) && p.startsWith('/'))
      )
    );

    if (uniquePaths.length === 0) {
      return true;
    }

    const frontendUrl = config.frontendUrl.replace(/\/$/, '');
    const secret = config.revalidationSecret;

    console.log(`[REVALIDATE] Triggering Next.js on-demand revalidation for:`, uniquePaths);

    // 1. Try POST to /api/revalidate with paths array in JSON body
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({
          paths: uniquePaths,
          path: uniquePaths[0], // fallback compatibility for single-path handlers
          secret,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[REVALIDATE SUCCESS] Successfully revalidated ${uniquePaths.length} path(s).`);
        return true;
      }

      // If POST wasn't handled (e.g. 404 or 405), fallback to individual GET queries
      console.warn(`[REVALIDATE WARN] POST returned status ${response.status}. Attempting GET fallback...`);
    } catch (postErr: any) {
      clearTimeout(timeoutId);
      console.warn(`[REVALIDATE WARN] POST attempt failed (${postErr?.message}). Trying GET fallback...`);
    }

    // 2. Fallback: Trigger GET request for each path
    await Promise.allSettled(
      uniquePaths.map(async (path) => {
        const getUrl = `${frontendUrl}/api/revalidate?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent(path)}`;
        const getController = new AbortController();
        const getTimeout = setTimeout(() => getController.abort(), 4000);
        try {
          await fetch(getUrl, { signal: getController.signal });
        } finally {
          clearTimeout(getTimeout);
        }
      })
    );

    return true;
  } catch (error: any) {
    // Non-blocking: Catch and log so database mutations never fail due to revalidation errors
    console.error(`[REVALIDATE ERROR] Failed to trigger Next.js ISR revalidation:`, error?.message || error);
    return false;
  }
};
