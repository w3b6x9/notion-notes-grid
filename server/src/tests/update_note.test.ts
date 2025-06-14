
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type CreateNoteInput, type UpdateNoteInput } from '../schema';
import { updateNote } from '../handlers/update_note';
import { eq } from 'drizzle-orm';

// Test input for creating a note
const testCreateInput: CreateNoteInput = {
  title: 'Original Title',
  content: 'Original content',
  position_x: 100,
  position_y: 200,
  width: 300,
  height: 250
};

// Helper function to create a test note directly in database
const createTestNote = async (input: CreateNoteInput) => {
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
};

describe('updateNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update note title', async () => {
    // Create a note first
    const createdNote = await createTestNote(testCreateInput);

    const updateInput: UpdateNoteInput = {
      id: createdNote.id,
      title: 'Updated Title'
    };

    const result = await updateNote(updateInput);

    expect(result.id).toEqual(createdNote.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.content).toEqual(testCreateInput.content); // Should remain unchanged
    expect(result.position_x).toEqual(testCreateInput.position_x); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdNote.updated_at).toBe(true);
  });

  it('should update note content', async () => {
    const createdNote = await createTestNote(testCreateInput);

    const updateInput: UpdateNoteInput = {
      id: createdNote.id,
      content: 'Updated content here'
    };

    const result = await updateNote(updateInput);

    expect(result.content).toEqual('Updated content here');
    expect(result.title).toEqual(testCreateInput.title); // Should remain unchanged
  });

  it('should update note position and dimensions', async () => {
    const createdNote = await createTestNote(testCreateInput);

    const updateInput: UpdateNoteInput = {
      id: createdNote.id,
      position_x: 500,
      position_y: 600,
      width: 400,
      height: 350
    };

    const result = await updateNote(updateInput);

    expect(result.position_x).toEqual(500);
    expect(result.position_y).toEqual(600);
    expect(result.width).toEqual(400);
    expect(result.height).toEqual(350);
    expect(result.title).toEqual(testCreateInput.title); // Should remain unchanged
  });

  it('should update multiple fields at once', async () => {
    const createdNote = await createTestNote(testCreateInput);

    const updateInput: UpdateNoteInput = {
      id: createdNote.id,
      title: 'New Title',
      content: 'New content',
      position_x: 50,
      width: 500
    };

    const result = await updateNote(updateInput);

    expect(result.title).toEqual('New Title');
    expect(result.content).toEqual('New content');
    expect(result.position_x).toEqual(50);
    expect(result.width).toEqual(500);
    expect(result.position_y).toEqual(testCreateInput.position_y); // Should remain unchanged
    expect(result.height).toEqual(testCreateInput.height); // Should remain unchanged
  });

  it('should save updated note to database', async () => {
    const createdNote = await createTestNote(testCreateInput);

    const updateInput: UpdateNoteInput = {
      id: createdNote.id,
      title: 'Database Update Test'
    };

    await updateNote(updateInput);

    // Verify in database
    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, createdNote.id))
      .execute();

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toEqual('Database Update Test');
    expect(notes[0].content).toEqual(testCreateInput.content);
  });

  it('should throw error for non-existent note', async () => {
    const updateInput: UpdateNoteInput = {
      id: 999999,
      title: 'This should fail'
    };

    await expect(updateNote(updateInput)).rejects.toThrow(/Note with id 999999 not found/i);
  });

  it('should handle empty content update', async () => {
    const createdNote = await createTestNote(testCreateInput);

    const updateInput: UpdateNoteInput = {
      id: createdNote.id,
      content: ''
    };

    const result = await updateNote(updateInput);

    expect(result.content).toEqual('');
    expect(result.title).toEqual(testCreateInput.title);
  });
});
