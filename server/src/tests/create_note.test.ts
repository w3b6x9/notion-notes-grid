
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type CreateNoteInput } from '../schema';
import { createNote } from '../handlers/create_note';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreateNoteInput = {
  title: 'Test Note',
  content: 'This is a test note content',
  position_x: 100,
  position_y: 200,
  width: 400,
  height: 300
};

describe('createNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a note with all provided fields', async () => {
    const result = await createNote(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Note');
    expect(result.content).toEqual('This is a test note content');
    expect(result.position_x).toEqual(100);
    expect(result.position_y).toEqual(200);
    expect(result.width).toEqual(400);
    expect(result.height).toEqual(300);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a note with default values', async () => {
    const minimalInput: CreateNoteInput = {
      title: 'Minimal Note',
      content: '',
      position_x: 0,
      position_y: 0,
      width: 300,
      height: 200
    };

    const result = await createNote(minimalInput);

    // Check defaults are applied
    expect(result.title).toEqual('Minimal Note');
    expect(result.content).toEqual('');
    expect(result.position_x).toEqual(0);
    expect(result.position_y).toEqual(0);
    expect(result.width).toEqual(300);
    expect(result.height).toEqual(200);
  });

  it('should save note to database', async () => {
    const result = await createNote(testInput);

    // Query using proper drizzle syntax
    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, result.id))
      .execute();

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toEqual('Test Note');
    expect(notes[0].content).toEqual('This is a test note content');
    expect(notes[0].position_x).toEqual(100);
    expect(notes[0].position_y).toEqual(200);
    expect(notes[0].width).toEqual(400);
    expect(notes[0].height).toEqual(300);
    expect(notes[0].created_at).toBeInstanceOf(Date);
    expect(notes[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty content correctly', async () => {
    const inputWithEmptyContent: CreateNoteInput = {
      title: 'Note with empty content',
      content: '',
      position_x: 50,
      position_y: 75,
      width: 250,
      height: 150
    };

    const result = await createNote(inputWithEmptyContent);

    expect(result.title).toEqual('Note with empty content');
    expect(result.content).toEqual('');
    expect(result.position_x).toEqual(50);
    expect(result.position_y).toEqual(75);
    expect(result.width).toEqual(250);
    expect(result.height).toEqual(150);
  });
});
