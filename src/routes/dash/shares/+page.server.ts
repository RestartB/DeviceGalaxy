import { redirect, error } from '@sveltejs/kit';

import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { InferSelectModel } from 'drizzle-orm';
import { shares, userDevices, user } from '$lib/server/db/schema';

import { fail, setError, message } from 'sveltekit-superforms';
import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';

import { subdomainSchema } from '$lib/schema/subdomain';
import { discordVerificationSchema } from '$lib/schema/discordVerification';

import { auth } from '$lib/server/auth';
import { generateShareId } from '$lib';

export const load = async (event) => {
  const parent = await event.parent();

  if (parent.user?.suspended) {
    return redirect(303, '/dash');
  }

  if (!parent.user) {
    return { shares: [] };
  }

  const accountShares = await db
    .select()
    .from(shares)
    .where(and(eq(shares.userId, parent.user.id), eq(shares.type, 0), eq(shares.internal, false)))
    .orderBy(asc(shares.id));

  const tagShares = await db
    .select()
    .from(shares)
    .where(and(eq(shares.userId, parent.user.id), eq(shares.type, 1)))
    .orderBy(asc(shares.id));

  const deviceShares = await db
    .select()
    .from(shares)
    .where(and(eq(shares.userId, parent.user.id), eq(shares.type, 2)))
    .orderBy(asc(shares.id));

  // Get user devices
  const userDevicesData = await db
    .select()
    .from(userDevices)
    .where(eq(userDevices.userId, parent.user.id))
    .orderBy(asc(userDevices.id));

  // Match device to shares
  const matchedDevices = deviceShares.map((share) => {
    const device = userDevicesData.find((device) => device.id === share.sharedDevice);
    return {
      ...device,
      shareId: share.id,
      shareType: share.type
    };
  });

  const subdomainForm = await superValidate(zod4(subdomainSchema));
  const deleteSubdomainForm = await superValidate(zod4(subdomainSchema));
  const discordForm = await superValidate(zod4(discordVerificationSchema));

  return {
    accountShares: accountShares as InferSelectModel<typeof shares>[],
    tagShares: tagShares as InferSelectModel<typeof shares>[],
    deviceShares: matchedDevices,
    subdomainForm,
    deleteSubdomainForm,
    discordForm
  };
};

export const actions = {
  claimSubdomain: async ({ request }) => {
    const formData = await request.formData();

    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session || !session.user) {
      return error(401, 'Unauthorized');
    }

    if (session.user.suspended) {
      return error(403, 'Your account is suspended.');
    }

    const form = await superValidate(formData, zod4(subdomainSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Check if subdomain is already taken
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.subdomain, form.data.subdomain))
      .limit(1)
      .get();

    if (existing && existing.id === session.user.id) {
      return message(form, 'This is already your subdomain.');
    }

    if (existing) {
      return setError(form, 'subdomain', 'This subdomain is already taken.');
    }

    const shareId = await generateShareId();

    const newShare = await db
      .insert(shares)
      .values({
        id: shareId,
        userId: session.user.id,
        type: 0,
        sharedDevice: null,
        sharedTags: null,
        internal: true
      })
      .returning({ id: shares.id });

    // Update user's subdomain
    const updated = await db
      .update(user)
      .set({ subdomain: form.data.subdomain, subdomainShareId: newShare[0].id })
      .where(eq(user.id, session.user.id))
      .returning();

    if (updated.length === 0) {
      return fail(500, { form });
    }

    return message(form, 'Updated');
  },
  deleteSubdomain: async ({ request }) => {
    const formData = await request.formData();

    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session || !session.user) {
      return error(401, 'Unauthorized');
    }

    if (session.user.suspended) {
      return error(403, 'Your account is suspended.');
    }

    const form = await superValidate(formData, zod4(subdomainSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Check if user has a subdomain
    if (!session.user.subdomain) {
      return setError(form, 'subdomain', 'You do not have a subdomain to delete.');
    }

    if (session.user.subdomain !== form.data.subdomain) {
      return setError(form, 'subdomain', 'This does not match your current subdomain.');
    }

    // Delete the associated share
    await db.delete(shares).where(eq(shares.id, session.user.subdomainShareId));

    // Update user's subdomain to null
    const updated = await db
      .update(user)
      .set({ subdomain: null, subdomainShareId: null, discordDomainVerifyToken: null })
      .where(eq(user.id, session.user.id))
      .returning();

    if (updated.length === 0) {
      return fail(500, { form });
    }

    return message(form, 'Updated');
  },
  tokenUpdate: async ({ request }) => {
    const formData = await request.formData();

    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session || !session.user) {
      return error(401, 'Unauthorized');
    }

    if (session.user.suspended) {
      return error(403, 'Your account is suspended.');
    }

    const form = await superValidate(formData, zod4(discordVerificationSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Update user's discord token
    const updated = await db
      .update(user)
      .set({ discordDomainVerifyToken: form.data.token })
      .where(eq(user.id, session.user.id))
      .returning();

    if (updated.length === 0) {
      return fail(500, { form });
    }

    return message(form, 'Updated');
  }
};
