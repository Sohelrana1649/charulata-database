import { Blog } from '../models/blog.model';
import { revalidateFrontend } from '../utils/revalidate';

/**
 * Checks for scheduled blogs whose release date/time has passed,
 * transitions them to 'published' status, and triggers Next.js ISR revalidation.
 *
 * @returns Array of blog slugs that were published and revalidated
 */
export const checkAndRevalidateScheduledBlogs = async (): Promise<string[]> => {
  const revalidatedSlugs: string[] = [];

  try {
    const now = new Date();
    const dueBlogs = await Blog.find({
      status: 'scheduled',
      scheduledAt: { $lte: now },
    });

    if (!dueBlogs || dueBlogs.length === 0) {
      return revalidatedSlugs;
    }

    console.log(`[SCHEDULED BLOG JOB] Found ${dueBlogs.length} scheduled blog(s) due for publishing.`);

    for (const blog of dueBlogs) {
      try {
        blog.status = 'published';
        await blog.save();

        const pathsToRevalidate = ['/blog', `/blog/${blog.slug}`];
        if (blog.isFeatured) {
          pathsToRevalidate.push('/');
        }

        await revalidateFrontend(pathsToRevalidate);

        console.log(
          `[SCHEDULED BLOG JOB] Successfully auto-published & revalidated blog: "${blog.title}" (slug: ${blog.slug})`
        );
        revalidatedSlugs.push(blog.slug);
      } catch (blogErr: any) {
        console.error(
          `[SCHEDULED BLOG JOB ERROR] Failed processing scheduled blog "${blog.slug}":`,
          blogErr?.message || blogErr
        );
      }
    }
  } catch (err: any) {
    console.error('[SCHEDULED BLOG JOB ERROR] Query failed:', err?.message || err);
  }

  return revalidatedSlugs;
};

/**
 * Starts the periodic timer to check scheduled blogs every minute
 */
export const startScheduledBlogJob = (intervalMs: number = 60000) => {
  console.log(`[SCHEDULED BLOG JOB] Scheduler initialized (running every ${Math.round(intervalMs / 1000)}s).`);

  // Run initial check
  checkAndRevalidateScheduledBlogs().catch((err) =>
    console.error('[SCHEDULED BLOG JOB INIT ERROR]', err)
  );

  // Set periodic execution
  const timer = setInterval(() => {
    checkAndRevalidateScheduledBlogs().catch((err) =>
      console.error('[SCHEDULED BLOG JOB INTERVAL ERROR]', err)
    );
  }, intervalMs);

  // Allow Node process to exit gracefully if needed
  if (timer.unref) {
    timer.unref();
  }

  return timer;
};
