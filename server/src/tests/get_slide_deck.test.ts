
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable } from '../db/schema';
import { type GetSlideDeckInput } from '../schema';
import { getSlideDeck } from '../handlers/get_slide_deck';

describe('getSlideDeck', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a slide deck when it exists', async () => {
    // Create a test slide deck
    const insertResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Presentation'
      })
      .returning()
      .execute();

    const createdDeck = insertResult[0];
    const input: GetSlideDeckInput = { id: createdDeck.id };

    const result = await getSlideDeck(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdDeck.id);
    expect(result!.name).toEqual('Test Presentation');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when slide deck does not exist', async () => {
    const input: GetSlideDeckInput = { id: 999 };

    const result = await getSlideDeck(input);

    expect(result).toBeNull();
  });

  it('should return the correct deck when multiple decks exist', async () => {
    // Create multiple test slide decks
    const deck1 = await db.insert(slideDecksTable)
      .values({ name: 'First Deck' })
      .returning()
      .execute();

    const deck2 = await db.insert(slideDecksTable)
      .values({ name: 'Second Deck' })
      .returning()
      .execute();

    const input: GetSlideDeckInput = { id: deck2[0].id };

    const result = await getSlideDeck(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(deck2[0].id);
    expect(result!.name).toEqual('Second Deck');
    expect(result!.id).not.toEqual(deck1[0].id);
  });
});
