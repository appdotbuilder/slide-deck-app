
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable, slidesTable } from '../db/schema';
import { type DeleteSlideDeckInput, type CreateSlideDeckInput, type CreateSlideInput } from '../schema';
import { deleteSlideDeck } from '../handlers/delete_slide_deck';
import { eq } from 'drizzle-orm';

// Test input
const testInput: DeleteSlideDeckInput = {
  id: 1
};

describe('deleteSlideDeck', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a slide deck', async () => {
    // Create a test slide deck first
    const deckInput: CreateSlideDeckInput = {
      name: 'Test Deck'
    };

    const deck = await db.insert(slideDecksTable)
      .values(deckInput)
      .returning()
      .execute();

    const deckId = deck[0].id;

    // Delete the slide deck
    const result = await deleteSlideDeck({ id: deckId });

    expect(result.success).toBe(true);

    // Verify deck is deleted from database
    const decks = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, deckId))
      .execute();

    expect(decks).toHaveLength(0);
  });

  it('should cascade delete associated slides', async () => {
    // Create a test slide deck
    const deckInput: CreateSlideDeckInput = {
      name: 'Test Deck with Slides'
    };

    const deck = await db.insert(slideDecksTable)
      .values(deckInput)
      .returning()
      .execute();

    const deckId = deck[0].id;

    // Create test slides for the deck
    const slideInput1: CreateSlideInput = {
      deck_id: deckId,
      title: 'Slide 1',
      body_text: 'Content 1',
      image_url: null,
      slide_order: 1
    };

    const slideInput2: CreateSlideInput = {
      deck_id: deckId,
      title: 'Slide 2',
      body_text: 'Content 2',
      image_url: null,
      slide_order: 2
    };

    await db.insert(slidesTable)
      .values([slideInput1, slideInput2])
      .execute();

    // Verify slides exist before deletion
    const slidesBefore = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.deck_id, deckId))
      .execute();

    expect(slidesBefore).toHaveLength(2);

    // Delete the slide deck
    const result = await deleteSlideDeck({ id: deckId });

    expect(result.success).toBe(true);

    // Verify deck is deleted
    const decks = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, deckId))
      .execute();

    expect(decks).toHaveLength(0);

    // Verify associated slides are also deleted (CASCADE)
    const slidesAfter = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.deck_id, deckId))
      .execute();

    expect(slidesAfter).toHaveLength(0);
  });

  it('should succeed even if deck does not exist', async () => {
    // Try to delete a non-existent deck
    const result = await deleteSlideDeck({ id: 999 });

    expect(result.success).toBe(true);
  });
});
