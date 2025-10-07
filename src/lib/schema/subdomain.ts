import { z } from 'zod/v4';

export const subdomainSchema = z.object({
  subdomain: z
    .string()
    .min(2, 'Subdomain must be at least 2 characters')
    .max(20, 'Subdomain must be 20 characters or less')
    .regex(/^[a-zA-Z0-9-]+$/, 'Subdomain can only contain letters, numbers, and hyphens')
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), {
      message: 'Subdomain cannot start or end with a hyphen'
    })
    .refine(
      (val) => {
        const reserved = [
          'www',
          'devicegalaxy',
          'mail',
          'ftp',
          'api',
          'admin',
          'dashboard',
          'app',
          'dev',
          'staging',
          'test',
          'docs',
          'status',
          'internal',
          'support',
          'help',
          'blog',
          'shop',
          'forum',
          'news',
          'static',
          'media',
          'images',
          'video',
          'videos',
          'cdn',
          'beta',
          'alpha',
          'root',
          'system',
          'secure',
          'login',
          'signin',
          'signup',
          'register',
          'account',
          'accounts',
          'user',
          'users',
          'profile',
          'settings',
          'billing',
          'payment',
          'payments',
          'invoice',
          'invoices',
          'subscribe',
          'subscription',
          'subscriptions',
          'unsubscribe',
          'contact',
          'feedback'
        ];
        return !reserved.includes(val);
      },
      {
        message: 'Subdomain is reserved and cannot be used'
      }
    )
});
