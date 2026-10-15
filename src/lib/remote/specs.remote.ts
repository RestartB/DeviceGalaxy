import { error } from '@sveltejs/kit';
import { command, form, getRequestEvent } from '$app/server';

import { z } from 'zod';
import {
  editSpecFieldSchema,
  editSpecValueSchema,
  newSpecFieldSchema,
  newSpecValueSchema
} from '#lib/schema/spec.js';

import { specificationField, specificationValue } from '#lib/server/db/schema.js';
import { db } from '#lib/server/db/index.js';
import { and, eq } from 'drizzle-orm';

export const createSpecField = form(newSpecFieldSchema, async ({ name }) => {
  const event = getRequestEvent();
  if (!event.locals.user) {
    return error(401, 'Not logged in');
  }

  const spec = await db
    .insert(specificationField)
    .values({
      userId: event.locals.user.id,
      name: name,
      key: name.toLowerCase().replaceAll(' ', '_')
    })
    .returning();

  return spec[0];
});

export const editSpecField = form(editSpecFieldSchema, async ({ fieldId, name }) => {
  const event = getRequestEvent();
  const userId = event.locals.user?.id;
  if (!userId) {
    error(401, 'Not logged in');
  }

  const specField = await db
    .update(specificationField)
    .set({ name: name })
    .where(and(eq(specificationField.userId, userId), eq(specificationField.id, fieldId)))
    .returning();

  if (specField.length === 0) {
    return error(404, 'Field not found');
  }

  return { success: true };
});

export const deleteSpecField = command(z.uuid(), async (id) => {
  const event = getRequestEvent();
  const userId = event.locals.user?.id;
  if (!userId) {
    error(401, 'Not logged in');
  }

  const oldSpecValue = await db
    .delete(specificationField)
    .where(and(eq(specificationField.id, id), eq(specificationField.userId, userId)))
    .returning();

  if (oldSpecValue.length === 0) {
    return error(404, 'Field not found');
  }

  return { success: true };
});

export const createSpecValue = form(newSpecValueSchema, async ({ fieldId, value }) => {
  const event = getRequestEvent();
  if (!event.locals.user) {
    return error(401, 'Not logged in');
  }

  const spec = await db
    .insert(specificationValue)
    .values({
      userId: event.locals.user.id,
      fieldId: fieldId,
      value: value
    })
    .returning();

  return spec[0];
});

export const editSpecValue = form(editSpecValueSchema, async ({ fieldId, valueId, value }) => {
  const event = getRequestEvent();
  const userId = event.locals.user?.id;
  if (!userId) {
    error(401, 'Not logged in');
  }

  const specValue = await db
    .update(specificationValue)
    .set({ value: value })
    .where(
      and(
        eq(specificationValue.userId, userId),
        eq(specificationValue.fieldId, fieldId),
        eq(specificationValue.id, valueId)
      )
    )
    .returning();

  if (specValue.length === 0) {
    return error(404, 'Value not found');
  }

  return { success: true };
});

export const deleteSpecValue = command(z.uuid(), async (id) => {
  const event = getRequestEvent();
  const userId = event.locals.user?.id;
  if (!userId) {
    error(401, 'Not logged in');
  }

  const oldSpecValue = await db
    .delete(specificationValue)
    .where(and(eq(specificationValue.id, id), eq(specificationValue.userId, userId)))
    .returning();

  if (oldSpecValue.length === 0) {
    return error(404, 'Value not found');
  }

  return { success: true };
});
