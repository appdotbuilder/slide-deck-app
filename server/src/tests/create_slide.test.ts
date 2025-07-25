
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slidesTable, slideDecksTable } from '../db/schema';
import { type CreateSlideInput } from '../schema';
import { createSlide } from '../handlers/create_slide';
import { eq } from 'drizzle-orm';

describe('createSlide', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a slide with all fields', async () => {
    // Create a test deck first
    const deck = await db.insert(slideDecksTable)
      .values({ name: 'Test Deck' })
      .returning()
      .execute();

    const testInput: CreateSlideInput = {
      deck_id: deck[0].id,
      title: 'Test Slide',
      body_text: 'This is test content',
      image_url: 'https://example.com/image.jpg',
      slide_order: 1
    };

    const result = await createSlide(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Slide');
    expect(result.body_text).toEqual('This is test content');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.deck_id).toEqual(deck[0].id);
    expect(result.slide_order).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a slide with minimal fields', async () => {
    // Create a test deck first
    const deck = await db.insert(slideDecksTable)
      .values({ name: 'Test Deck' })
      .returning()
      .execute();

    const testInput: CreateSlideInput = {
      deck_id: deck[0].id,
      title: 'Minimal Slide',
      slide_order: 0
    };

    const result = await createSlide(testInput);

    expect(result.title).toEqual('Minimal Slide');
    expect(result.body_text).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.deck_id).toEqual(deck[0].id);
    expect(result.slide_order).toEqual(0);
  });

  it('should save slide to database', async () => {
    // Create a test deck first
    const deck = await db.insert(slideDecksTable)
      .values({ name: 'Test Deck' })
      .returning()
      .execute();

    const testInput: CreateSlideInput = {
      deck_id: deck[0].id,
      title: 'Database Test Slide',
      body_text: 'Content for database test',
      slide_order: 2
    };

    const result = await createSlide(testInput);

    // Query the database to verify the slide was saved
    const slides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.id, result.id))
      .execute();

    expect(slides).toHaveLength(1);
    expect(slides[0].title).toEqual('Database Test Slide');
    expect(slides[0].body_text).toEqual('Content for database test');
    expect(slides[0].deck_id).toEqual(deck[0].id);
    expect(slides[0].slide_order).toEqual(2);
    expect(slides[0].created_at).toBeInstanceOf(Date);
  });

  it('should update parent deck updated_at timestamp', async () => {
    // Create a test deck first
    const deck = await db.insert(slideDecksTable)
      .values({ name: 'Test Deck' })
      .returning()
      .execute();

    const originalUpdatedAt = deck[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const testInput: CreateSlideInput = {
      deck_id: deck[0].id,
      title: 'Timestamp Test Slide',
      slide_order: 1
    };

    await createSlide(testInput);

    // Check that the parent deck's updated_at was modified
    const updatedDeck = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, deck[0].id))
      .execute();

    expect(updatedDeck[0].updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error for non-existent deck', async () => {
    const testInput: CreateSlideInput = {
      deck_id: 999, // Non-existent deck ID
      title: 'Orphan Slide',
      slide_order: 1
    };

    await expect(createSlide(testInput)).rejects.toThrow(/deck with id 999 not found/i);
  });
});
