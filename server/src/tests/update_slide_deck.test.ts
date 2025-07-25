
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable } from '../db/schema';
import { type UpdateSlideDeckInput, type CreateSlideDeckInput } from '../schema';
import { updateSlideDeck } from '../handlers/update_slide_deck';
import { eq } from 'drizzle-orm';

describe('updateSlideDeck', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a slide deck', async () => {
    // Create test deck first using direct database insert
    const createResult = await db.insert(slideDecksTable)
      .values({
        name: 'Original Deck Name'
      })
      .returning()
      .execute();

    const createdDeck = createResult[0];

    // Update the deck
    const updateInput: UpdateSlideDeckInput = {
      id: createdDeck.id,
      name: 'Updated Deck Name'
    };

    const result = await updateSlideDeck(updateInput);

    // Verify the update
    expect(result.id).toEqual(createdDeck.id);
    expect(result.name).toEqual('Updated Deck Name');
    expect(result.created_at).toEqual(createdDeck.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdDeck.updated_at.getTime());
  });

  it('should save updated deck to database', async () => {
    // Create test deck first using direct database insert
    const createResult = await db.insert(slideDecksTable)
      .values({
        name: 'Original Deck Name'
      })
      .returning()
      .execute();

    const createdDeck = createResult[0];

    // Update the deck
    const updateInput: UpdateSlideDeckInput = {
      id: createdDeck.id,
      name: 'Updated Deck Name'
    };

    await updateSlideDeck(updateInput);

    // Query database to verify the update
    const decks = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, createdDeck.id))
      .execute();

    expect(decks).toHaveLength(1);
    expect(decks[0].name).toEqual('Updated Deck Name');
    expect(decks[0].updated_at).toBeInstanceOf(Date);
    expect(decks[0].updated_at.getTime()).toBeGreaterThan(createdDeck.updated_at.getTime());
  });

  it('should throw error when deck does not exist', async () => {
    const updateInput: UpdateSlideDeckInput = {
      id: 999, // Non-existent ID
      name: 'Updated Name'
    };

    await expect(updateSlideDeck(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should preserve created_at timestamp when updating', async () => {
    // Create test deck first using direct database insert
    const createResult = await db.insert(slideDecksTable)
      .values({
        name: 'Original Deck Name'
      })
      .returning()
      .execute();

    const createdDeck = createResult[0];

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update the deck
    const updateInput: UpdateSlideDeckInput = {
      id: createdDeck.id,
      name: 'Updated Deck Name'
    };

    const result = await updateSlideDeck(updateInput);

    // Verify created_at is preserved
    expect(result.created_at.getTime()).toEqual(createdDeck.created_at.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThan(createdDeck.updated_at.getTime());
  });
});
