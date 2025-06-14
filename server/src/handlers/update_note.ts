
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type UpdateNoteInput, type Note } from '../schema';
import { eq } from 'drizzle-orm';

export const updateNote = async (input: UpdateNoteInput): Promise<Note> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof notesTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.content !== undefined) {
      updateData.content = input.content;
    }
    if (input.position_x !== undefined) {
      updateData.position_x = input.position_x;
    }
    if (input.position_y !== undefined) {
      updateData.position_y = input.position_y;
    }
    if (input.width !== undefined) {
      updateData.width = input.width;
    }
    if (input.height !== undefined) {
      updateData.height = input.height;
    }

    // Update the note
    const result = await db.update(notesTable)
      .set(updateData)
      .where(eq(notesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Note with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Note update failed:', error);
    throw error;
  }
};
