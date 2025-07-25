
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable, slidesTable } from '../db/schema';
import { type GetSlidesInput } from '../schema';
import { getSlides } from '../handlers/get_slides';

describe('getSlides', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return slides for a deck ordered by slide_order', async () => {
    // Create a test deck
    const deckResult = await db.insert(slideDecksTable)
      .values({ name: 'Test Deck' })
      .returning()
      .execute();
    const deckId = deckResult[0].id;

    // Create slides in random order
    await db.insert(slidesTable)
      .values([
        {
          deck_id: deckId,
          title: 'Third Slide',
          body_text: 'This is the third slide',
          image_url: null,
          slide_order: 3
        },
        {
          deck_id: deckId,
          title: 'First Slide',
          body_text: 'This is the first slide',
          image_url: 'https://example.com/image1.jpg',
          slide_order: 1
        },
        {
          deck_id: deckId,
          title: 'Second Slide',
          body_text: null,
          image_url: 'https://example.com/image2.jpg',
          slide_order: 2
        }
      ])
      .execute();

    const input: GetSlidesInput = { deck_id: deckId };
    const result = await getSlides(input);

    expect(result).toHaveLength(3);
    
    // Verify slides are ordered by slide_order
    expect(result[0].title).toEqual('First Slide');
    expect(result[0].slide_order).toEqual(1);
    expect(result[0].body_text).toEqual('This is the first slide');
    expect(result[0].image_url).toEqual('https://example.com/image1.jpg');

    expect(result[1].title).toEqual('Second Slide');
    expect(result[1].slide_order).toEqual(2);
    expect(result[1].body_text).toBeNull();
    expect(result[1].image_url).toEqual('https://example.com/image2.jpg');

    expect(result[2].title).toEqual('Third Slide');
    expect(result[2].slide_order).toEqual(3);
    expect(result[2].body_text).toEqual('This is the third slide');
    expect(result[2].image_url).toBeNull();

    // Verify all slides have the correct deck_id
    result.forEach(slide => {
      expect(slide.deck_id).toEqual(deckId);
      expect(slide.id).toBeDefined();
      expect(slide.created_at).toBeInstanceOf(Date);
      expect(slide.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array for deck with no slides', async () => {
    // Create a test deck without slides
    const deckResult = await db.insert(slideDecksTable)
      .values({ name: 'Empty Deck' })
      .returning()
      .execute();
    const deckId = deckResult[0].id;

    const input: GetSlidesInput = { deck_id: deckId };
    const result = await getSlides(input);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for non-existent deck', async () => {
    const input: GetSlidesInput = { deck_id: 999 };
    const result = await getSlides(input);

    expect(result).toHaveLength(0);
  });

  it('should only return slides for the specified deck', async () => {
    // Create two test decks
    const deck1Result = await db.insert(slideDecksTable)
      .values({ name: 'Deck 1' })
      .returning()
      .execute();
    const deck1Id = deck1Result[0].id;

    const deck2Result = await db.insert(slideDecksTable)
      .values({ name: 'Deck 2' })
      .returning()
      .execute();
    const deck2Id = deck2Result[0].id;

    // Create slides for both decks
    await db.insert(slidesTable)
      .values([
        {
          deck_id: deck1Id,
          title: 'Deck 1 Slide',
          body_text: 'Content for deck 1',
          image_url: null,
          slide_order: 1
        },
        {
          deck_id: deck2Id,
          title: 'Deck 2 Slide',
          body_text: 'Content for deck 2',
          image_url: null,
          slide_order: 1
        }
      ])
      .execute();

    const input: GetSlidesInput = { deck_id: deck1Id };
    const result = await getSlides(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Deck 1 Slide');
    expect(result[0].deck_id).toEqual(deck1Id);
  });
});
