
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type DeleteNoteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteNote = async (input: DeleteNoteInput): Promise<{ success: boolean }> => {
  try {
    // Delete the note with the specified ID
    const result = await db.delete(notesTable)
      .where(eq(notesTable.id, input.id))
      .execute();

    // Return success true regardless of whether a row was actually deleted
    // This makes the operation idempotent (safe to call multiple times)
    return { success: true };
  } catch (error) {
    console.error('Note deletion failed:', error);
    throw error;
  }
};
