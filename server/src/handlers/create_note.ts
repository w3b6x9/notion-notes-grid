
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type CreateNoteInput, type Note } from '../schema';

export const createNote = async (input: CreateNoteInput): Promise<Note> => {
  try {
    // Insert note record
    const result = await db.insert(notesTable)
      .values({
        title: input.title,
        content: input.content,
        position_x: input.position_x,
        position_y: input.position_y,
        width: input.width,
        height: input.height
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Note creation failed:', error);
    throw error;
  }
};
