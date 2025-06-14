
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type CreateNoteInput, type UpdateNotePositionInput } from '../schema';
import { updateNotePosition } from '../handlers/update_note_position';
import { eq } from 'drizzle-orm';

// Helper to create a test note
const createTestNote = async (noteData: CreateNoteInput) => {
  const result = await db.insert(notesTable)
    .values({
      title: noteData.title,
      content: noteData.content,
      position_x: noteData.position_x,
      position_y: noteData.position_y,
      width: noteData.width,
      height: noteData.height
    })
    .returning()
    .execute();
  
  return result[0];
};

const testNoteInput: CreateNoteInput = {
  title: 'Test Note',
  content: 'Test content',
  position_x: 100,
  position_y: 200,
  width: 300,
  height: 400
};

describe('updateNotePosition', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update note position', async () => {
    // Create test note
    const createdNote = await createTestNote(testNoteInput);

    const updateInput: UpdateNotePositionInput = {
      id: createdNote.id,
      position_x: 150,
      position_y: 250
    };

    const result = await updateNotePosition(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(createdNote.id);
    expect(result.position_x).toEqual(150);
    expect(result.position_y).toEqual(250);
    expect(result.width).toEqual(300); // Should remain unchanged
    expect(result.height).toEqual(400); // Should remain unchanged
    expect(result.title).toEqual('Test Note'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdNote.updated_at.getTime());
  });

  it('should update position and dimensions when provided', async () => {
    // Create test note
    const createdNote = await createTestNote(testNoteInput);

    const updateInput: UpdateNotePositionInput = {
      id: createdNote.id,
      position_x: 75,
      position_y: 125,
      width: 500,
      height: 350
    };

    const result = await updateNotePosition(updateInput);

    // Verify all updated fields
    expect(result.position_x).toEqual(75);
    expect(result.position_y).toEqual(125);
    expect(result.width).toEqual(500);
    expect(result.height).toEqual(350);
    expect(result.title).toEqual('Test Note'); // Should remain unchanged
    expect(result.content).toEqual('Test content'); // Should remain unchanged
  });

  it('should save position changes to database', async () => {
    // Create test note
    const createdNote = await createTestNote(testNoteInput);

    const updateInput: UpdateNotePositionInput = {
      id: createdNote.id,
      position_x: 300,
      position_y: 400
    };

    await updateNotePosition(updateInput);

    // Query database to verify changes were persisted
    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, createdNote.id))
      .execute();

    expect(notes).toHaveLength(1);
    expect(notes[0].position_x).toEqual(300);
    expect(notes[0].position_y).toEqual(400);
    expect(notes[0].width).toEqual(300); // Should remain unchanged
    expect(notes[0].height).toEqual(400); // Should remain unchanged
  });

  it('should throw error for non-existent note', async () => {
    const updateInput: UpdateNotePositionInput = {
      id: 999, // Non-existent ID
      position_x: 100,
      position_y: 200
    };

    await expect(updateNotePosition(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle position updates with only dimensions', async () => {
    // Create test note
    const createdNote = await createTestNote(testNoteInput);

    const updateInput: UpdateNotePositionInput = {
      id: createdNote.id,
      position_x: 100, // Same as original
      position_y: 200, // Same as original
      width: 600,
      height: 500
    };

    const result = await updateNotePosition(updateInput);

    // Position should remain the same, dimensions should change
    expect(result.position_x).toEqual(100);
    expect(result.position_y).toEqual(200);
    expect(result.width).toEqual(600);
    expect(result.height).toEqual(500);
  });
});
