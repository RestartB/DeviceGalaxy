// See https://svelte.dev/docs/kit/types#app.d.ts

import { auth } from '$lib/server/auth';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: typeof auth.$Infer.Session.session | undefined;
      user: typeof auth.$Infer.Session.user | undefined;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  interface Window {
    onloadTurnstileCallback?: () => void;
  }
}

export {};
