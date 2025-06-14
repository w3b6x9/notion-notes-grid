
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type UpdateNotePositionInput, type Note } from '../schema';
import { eq } from 'drizzle-orm';

export const updateNotePosition = async (input: UpdateNotePositionInput): Promise<Note> => {
  try {
    // Build update values object - only include provided fields
    const updateValues: Partial<typeof notesTable.$inferInsert> = {
      position_x: input.position_x,
      position_y: input.position_y,
      updated_at: new Date()
    };

    // Add optional dimensions if provided
    if (input.width !== undefined) {
      updateValues.width = input.width;
    }
    if (input.height !== undefined) {
      updateValues.height = input.height;
    }

    // Update the note position
    const result = await db.update(notesTable)
      .set(updateValues)
      .where(eq(notesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Note with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Note position update failed:', error);
    throw error;
  }
};
