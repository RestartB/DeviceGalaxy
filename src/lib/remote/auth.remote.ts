import { error, invalid } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';
import { auth } from '#lib/server/auth.js';

import { z } from 'zod';

import { TURNSTILE_ENABLED } from '$app/env/public';
import { APIError } from 'better-auth';

export const logIn = form(
  z.object({
    email: z.string().trim().pipe(z.email('Please provide a valid email address.')),
    password: z
      .string('Please provide a password.')
      .min(8, 'Password must be at least 8 characters long.')
      .max(128, 'Password cannot be longer than 128 characters.'),
    turnstileToken: TURNSTILE_ENABLED
      ? z.string().min(1, 'Please complete the Captcha.')
      : z.string().optional().default('')
  }),
  async ({ email, password, turnstileToken }, issue) => {
    const event = getRequestEvent();
    if (event.locals.user) {
      return error(403, 'Already signed in');
    }

    try {
      await auth.api.signInEmail({
        body: {
          email: email,
          password: password,
          rememberMe: true,
          callbackURL: 'http://127.0.0.1'
        },
        // This endpoint requires session cookies.
        headers: { ...event.request.headers, 'x-captcha-response': turnstileToken }
      });
    } catch (error) {
      const errorBody = error instanceof APIError ? error.body : undefined;
      console.error(`Sign in error: ${errorBody ? errorBody.code : error}`);
      if (!errorBody || !errorBody.code || !errorBody.message) {
        return { success: false };
      }

      if (errorBody.code === 'INVALID_EMAIL_OR_PASSWORD') {
        invalid(issue.password(errorBody.message));
      } else {
        return { success: false };
      }
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
      turnstileToken: TURNSTILE_ENABLED
        ? z.string().min(1, 'Please complete the Captcha.')
        : z.string().optional().default('')
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: 'Passwords must match.',
      path: ['passwordConfirm']
    }),
  async ({ name, email, password, turnstileToken }, issue) => {
    const event = getRequestEvent();
    if (event.locals.user) {
      return error(403, 'Already signed in');
    }

    try {
      await auth.api.signUpEmail({
        body: {
          name: name,
          email: email,
          password: password,
          callbackURL: 'http://127.0.0.1'
        },
        headers: { 'x-captcha-response': turnstileToken }
      });
    } catch (error) {
      const errorBody = error instanceof APIError ? error.body : undefined;
      console.error(`Sign up error: ${errorBody ? errorBody.code : error}`);
      if (!errorBody || !errorBody.code || !errorBody.message) {
        return { success: false };
      }

      if (errorBody.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        invalid(issue.email(errorBody.message));
      } else {
        return { success: false };
      }
    }

    return { success: true };
  }
);
