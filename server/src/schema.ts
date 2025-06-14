
import { z } from 'zod';

// Note schema
export const noteSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  position_x: z.number().int(),
  position_y: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Note = z.infer<typeof noteSchema>;

// Input schema for creating notes
export const createNoteInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().default(''),
  position_x: z.number().int().default(0),
  position_y: z.number().int().default(0),
  width: z.number().int().default(300),
  height: z.number().int().default(200)
});

export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;

// Input schema for updating notes
export const updateNoteInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().optional(),
  position_x: z.number().int().optional(),
  position_y: z.number().int().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional()
});

export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>;

// Input schema for deleting notes
export const deleteNoteInputSchema = z.object({
  id: z.number()
});

export type DeleteNoteInput = z.infer<typeof deleteNoteInputSchema>;

// Input schema for updating note position (for drag-and-drop)
export const updateNotePositionInputSchema = z.object({
  id: z.number(),
  position_x: z.number().int(),
  position_y: z.number().int(),
  width: z.number().int().optional(),
  height: z.number().int().optional()
});

export type UpdateNotePositionInput = z.infer<typeof updateNotePositionInputSchema>;
