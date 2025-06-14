
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type DeleteNoteInput, type CreateNoteInput } from '../schema';
import { deleteNote } from '../handlers/delete_note';
import { eq } from 'drizzle-orm';

// Test input for creating a note to delete
const createTestInput: CreateNoteInput = {
  title: 'Test Note',
  content: 'A note for testing deletion',
  position_x: 100,
  position_y: 200,
  width: 300,
  height: 200
};

describe('deleteNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing note', async () => {
    // Create a note first
    const createdNotes = await db.insert(notesTable)
      .values(createTestInput)
      .returning()
      .execute();
    
    const createdNote = createdNotes[0];
    expect(createdNote.id).toBeDefined();

    // Delete the note
    const deleteInput: DeleteNoteInput = { id: createdNote.id };
    const result = await deleteNote(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify note no longer exists in database
    const remainingNotes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, createdNote.id))
      .execute();

    expect(remainingNotes).toHaveLength(0);
  });

  it('should return success even when note does not exist', async () => {
    // Try to delete a non-existent note
    const deleteInput: DeleteNoteInput = { id: 999 };
    const result = await deleteNote(deleteInput);

    // Should still return success (idempotent operation)
    expect(result.success).toBe(true);
  });

  it('should not affect other notes when deleting one note', async () => {
    // Create multiple notes
    const note1Input = { ...createTestInput, title: 'Note 1' };
    const note2Input = { ...createTestInput, title: 'Note 2' };
    
    const createdNotes = await db.insert(notesTable)
      .values([note1Input, note2Input])
      .returning()
      .execute();

    expect(createdNotes).toHaveLength(2);
    const [note1, note2] = createdNotes;

    // Delete only the first note
    const deleteInput: DeleteNoteInput = { id: note1.id };
    const result = await deleteNote(deleteInput);

    expect(result.success).toBe(true);

    // Verify first note is deleted
    const deletedNotes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, note1.id))
      .execute();
    expect(deletedNotes).toHaveLength(0);

    // Verify second note still exists
    const remainingNotes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, note2.id))
      .execute();
    expect(remainingNotes).toHaveLength(1);
    expect(remainingNotes[0].title).toEqual('Note 2');
  });
});
