
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type CreateNoteInput } from '../schema';
import { getNotes } from '../handlers/get_notes';

// Test data
const testNote1: CreateNoteInput = {
  title: 'First Note',
  content: 'This is the first note',
  position_x: 10,
  position_y: 20,
  width: 300,
  height: 200
};

const testNote2: CreateNoteInput = {
  title: 'Second Note',
  content: 'This is the second note',
  position_x: 50,
  position_y: 100,
  width: 400,
  height: 250
};

describe('getNotes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no notes exist', async () => {
    const result = await getNotes();

    expect(result).toEqual([]);
  });

  it('should return all notes', async () => {
    // Create test notes
    await db.insert(notesTable)
      .values([
        {
          title: testNote1.title,
          content: testNote1.content,
          position_x: testNote1.position_x,
          position_y: testNote1.position_y,
          width: testNote1.width,
          height: testNote1.height
        },
        {
          title: testNote2.title,
          content: testNote2.content,
          position_x: testNote2.position_x,
          position_y: testNote2.position_y,
          width: testNote2.width,
          height: testNote2.height
        }
      ])
      .execute();

    const result = await getNotes();

    expect(result).toHaveLength(2);
    
    // Verify note data
    const notesByTitle = result.reduce((acc, note) => {
      acc[note.title] = note;
      return acc;
    }, {} as Record<string, typeof result[0]>);

    expect(notesByTitle['First Note']).toBeDefined();
    expect(notesByTitle['First Note'].content).toEqual('This is the first note');
    expect(notesByTitle['First Note'].position_x).toEqual(10);
    expect(notesByTitle['First Note'].position_y).toEqual(20);
    expect(notesByTitle['First Note'].width).toEqual(300);
    expect(notesByTitle['First Note'].height).toEqual(200);
    expect(notesByTitle['First Note'].created_at).toBeInstanceOf(Date);
    expect(notesByTitle['First Note'].updated_at).toBeInstanceOf(Date);

    expect(notesByTitle['Second Note']).toBeDefined();
    expect(notesByTitle['Second Note'].content).toEqual('This is the second note');
    expect(notesByTitle['Second Note'].position_x).toEqual(50);
    expect(notesByTitle['Second Note'].position_y).toEqual(100);
  });

  it('should return notes ordered by updated_at descending', async () => {
    // Insert first note
    const firstInsert = await db.insert(notesTable)
      .values({
        title: 'Older Note',
        content: 'This was created first',
        position_x: 0,
        position_y: 0,
        width: 300,
        height: 200
      })
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Insert second note (should have newer timestamp)
    await db.insert(notesTable)
      .values({
        title: 'Newer Note',
        content: 'This was created second',
        position_x: 0,
        position_y: 0,
        width: 300,
        height: 200
      })
      .execute();

    const result = await getNotes();

    expect(result).toHaveLength(2);
    // First note in result should be the newer one (descending order)
    expect(result[0].title).toEqual('Newer Note');
    expect(result[1].title).toEqual('Older Note');
    expect(result[0].updated_at >= result[1].updated_at).toBe(true);
  });
});
