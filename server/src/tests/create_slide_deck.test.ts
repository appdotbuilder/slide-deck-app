
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable, slidesTable } from '../db/schema';
import { type CreateSlideDeckInput } from '../schema';
import { createSlideDeck } from '../handlers/create_slide_deck';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateSlideDeckInput = {
  name: 'Test Slide Deck'
};

describe('createSlideDeck', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a slide deck', async () => {
    const result = await createSlideDeck(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Slide Deck');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save slide deck to database', async () => {
    const result = await createSlideDeck(testInput);

    // Query using proper drizzle syntax
    const slideDecks = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, result.id))
      .execute();

    expect(slideDecks).toHaveLength(1);
    expect(slideDecks[0].name).toEqual('Test Slide Deck');
    expect(slideDecks[0].created_at).toBeInstanceOf(Date);
    expect(slideDecks[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create a default first slide for the new deck', async () => {
    const result = await createSlideDeck(testInput);

    // Query for slides associated with the created deck
    const slides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.deck_id, result.id))
      .execute();

    expect(slides).toHaveLength(1);
    expect(slides[0].title).toEqual('First Slide');
    expect(slides[0].body_text).toBeNull();
    expect(slides[0].image_url).toBeNull();
    expect(slides[0].slide_order).toEqual(1);
    expect(slides[0].deck_id).toEqual(result.id);
    expect(slides[0].created_at).toBeInstanceOf(Date);
    expect(slides[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty deck name gracefully', async () => {
    const emptyNameInput: CreateSlideDeckInput = {
      name: ''
    };

    // This should work at the handler level since validation happens at the schema level
    const result = await createSlideDeck(emptyNameInput);
    
    expect(result.name).toEqual('');
    expect(result.id).toBeDefined();
    
    // Verify the default slide was still created
    const slides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.deck_id, result.id))
      .execute();

    expect(slides).toHaveLength(1);
    expect(slides[0].title).toEqual('First Slide');
  });
});
