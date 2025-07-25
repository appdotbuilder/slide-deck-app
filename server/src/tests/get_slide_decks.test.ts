
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable } from '../db/schema';
import { getSlideDecks } from '../handlers/get_slide_decks';
import { eq } from 'drizzle-orm';

describe('getSlideDecks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no slide decks exist', async () => {
    const result = await getSlideDecks();

    expect(result).toEqual([]);
  });

  it('should return all slide decks', async () => {
    // Create test slide decks
    await db.insert(slideDecksTable)
      .values([
        { name: 'First Deck' },
        { name: 'Second Deck' }
      ])
      .execute();

    const result = await getSlideDecks();

    expect(result).toHaveLength(2);
    expect(result.some(deck => deck.name === 'First Deck')).toBe(true);
    expect(result.some(deck => deck.name === 'Second Deck')).toBe(true);
    result.forEach(deck => {
      expect(deck.id).toBeDefined();
      expect(deck.created_at).toBeInstanceOf(Date);
      expect(deck.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return slide decks ordered by updated_at descending', async () => {
    // Create decks with specific timestamps
    const now = new Date();
    const earlier = new Date(now.getTime() - 60000); // 1 minute earlier
    
    // Insert first deck with earlier timestamp
    const firstDeck = await db.insert(slideDecksTable)
      .values({ 
        name: 'First Deck',
        created_at: earlier,
        updated_at: earlier
      })
      .returning()
      .execute();

    // Insert second deck with current timestamp
    const secondDeck = await db.insert(slideDecksTable)
      .values({ 
        name: 'Second Deck',
        created_at: now,
        updated_at: now
      })
      .returning()
      .execute();

    const result = await getSlideDecks();

    expect(result).toHaveLength(2);
    // Most recently updated should be first (Second Deck has later timestamp)
    expect(result[0].name).toEqual('Second Deck');
    expect(result[1].name).toEqual('First Deck');
    expect(result[0].updated_at >= result[1].updated_at).toBe(true);
  });
});
