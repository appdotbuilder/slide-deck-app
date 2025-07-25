
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable, slidesTable } from '../db/schema';
import { type GetSlideDeckInput } from '../schema';
import { getSlideDeckWithSlides } from '../handlers/get_slide_deck_with_slides';

describe('getSlideDeckWithSlides', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when deck does not exist', async () => {
    const input: GetSlideDeckInput = { id: 999 };
    const result = await getSlideDeckWithSlides(input);
    expect(result).toBeNull();
  });

  it('should return deck with empty slides array when deck has no slides', async () => {
    // Create a deck without slides
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Empty Deck'
      })
      .returning()
      .execute();

    const deck = deckResult[0];
    const input: GetSlideDeckInput = { id: deck.id };
    const result = await getSlideDeckWithSlides(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(deck.id);
    expect(result!.name).toEqual('Empty Deck');
    expect(result!.slides).toHaveLength(0);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return deck with slides ordered by slide_order', async () => {
    // Create a deck
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Presentation'
      })
      .returning()
      .execute();

    const deck = deckResult[0];

    // Create slides with different orders (insert in random order)
    await db.insert(slidesTable)
      .values([
        {
          deck_id: deck.id,
          title: 'Third Slide',
          body_text: 'This is slide 3',
          image_url: null,
          slide_order: 3
        },
        {
          deck_id: deck.id,
          title: 'First Slide',
          body_text: 'This is slide 1',
          image_url: 'https://example.com/image1.jpg',
          slide_order: 1
        },
        {
          deck_id: deck.id,
          title: 'Second Slide',
          body_text: null,
          image_url: 'https://example.com/image2.jpg',
          slide_order: 2
        }
      ])
      .execute();

    const input: GetSlideDeckInput = { id: deck.id };
    const result = await getSlideDeckWithSlides(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(deck.id);
    expect(result!.name).toEqual('Test Presentation');
    expect(result!.slides).toHaveLength(3);

    // Verify slides are ordered by slide_order
    expect(result!.slides[0].title).toEqual('First Slide');
    expect(result!.slides[0].slide_order).toEqual(1);
    expect(result!.slides[0].body_text).toEqual('This is slide 1');
    expect(result!.slides[0].image_url).toEqual('https://example.com/image1.jpg');

    expect(result!.slides[1].title).toEqual('Second Slide');
    expect(result!.slides[1].slide_order).toEqual(2);
    expect(result!.slides[1].body_text).toBeNull();
    expect(result!.slides[1].image_url).toEqual('https://example.com/image2.jpg');

    expect(result!.slides[2].title).toEqual('Third Slide');
    expect(result!.slides[2].slide_order).toEqual(3);
    expect(result!.slides[2].body_text).toEqual('This is slide 3');
    expect(result!.slides[2].image_url).toBeNull();

    // Verify all slides have proper timestamps
    result!.slides.forEach(slide => {
      expect(slide.created_at).toBeInstanceOf(Date);
      expect(slide.updated_at).toBeInstanceOf(Date);
      expect(slide.deck_id).toEqual(deck.id);
      expect(slide.id).toBeDefined();
    });
  });

  it('should return complete deck data with all slide fields', async () => {
    // Create a deck
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Complete Test Deck'
      })
      .returning()
      .execute();

    const deck = deckResult[0];

    // Create one slide with all fields populated
    await db.insert(slidesTable)
      .values({
        deck_id: deck.id,
        title: 'Complete Slide',
        body_text: 'Full body text content',
        image_url: 'https://example.com/complete.jpg',
        slide_order: 1
      })
      .execute();

    const input: GetSlideDeckInput = { id: deck.id };
    const result = await getSlideDeckWithSlides(input);

    expect(result).not.toBeNull();
    
    // Verify deck fields
    expect(result!.id).toEqual(deck.id);
    expect(result!.name).toEqual('Complete Test Deck');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    
    // Verify slide fields
    expect(result!.slides).toHaveLength(1);
    const slide = result!.slides[0];
    expect(slide.id).toBeDefined();
    expect(slide.deck_id).toEqual(deck.id);
    expect(slide.title).toEqual('Complete Slide');
    expect(slide.body_text).toEqual('Full body text content');
    expect(slide.image_url).toEqual('https://example.com/complete.jpg');
    expect(slide.slide_order).toEqual(1);
    expect(slide.created_at).toBeInstanceOf(Date);
    expect(slide.updated_at).toBeInstanceOf(Date);
  });
});
