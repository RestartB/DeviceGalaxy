import { error, redirect } from '@sveltejs/kit';
import { query, form, getRequestEvent } from '$app/server';
import { auth } from '$lib/server/auth';

import { z } from 'zod';

export const logIn = form(
  z.object({
    email: z.string().trim().pipe(z.email('Please provide a valid email address.')),
    password: z
      .string('Please provide a password.')
      .min(8, 'Password must be at least 8 characters long.')
      .max(128, 'Password cannot be longer than 128 characters.'),
    turnstileToken: z.string('Please complete the Captcha.')
  }),
  async ({ email, password, turnstileToken }) => {
    const event = await getRequestEvent();

    try {
      const data = await auth.api.signInEmail({
        body: {
          email: email,
          password: password,
          rememberMe: true,
          callbackURL: 'http://127.0.0.1'
        },
        // This endpoint requires session cookies.
        headers: { ...event.request.headers, 'x-captcha-response': turnstileToken }
      });
    } catch {
      return { success: false };
    }

    return { success: true };
  }
);

export const signUp = form(
  z
    .object({
      name: z
        .string('Please provide a name.')
        .trim()
        .min(1, 'Please provide a name.')
        .max(64, 'Name must be shorter than 64 characters.'),
      email: z.string().trim().pipe(z.email('Please provide a valid email address.')),
      password: z
        .string('Please provide a password.')
        .min(8, 'Password must be at least 8 characters long.')
        .max(128, 'Password cannot be longer than 128 characters.'),
      passwordConfirm: z.string('Please confirm your password.'),
      turnstileToken: z.string('Please complete the Captcha.')
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: 'Passwords must match.',
      path: ['passwordConfirm']
    }),
  async ({ name, email, password, turnstileToken }) => {
    const event = await getRequestEvent();

    try {
      const data = await auth.api.signUpEmail({
        body: {
          name: name,
          email: email,
          password: password,
          callbackURL: 'http://127.0.0.1'
        },
        headers: { 'x-captcha-response': turnstileToken }
      });
    } catch {
      return { success: false };
    }

    return { success: true };
  }
);
