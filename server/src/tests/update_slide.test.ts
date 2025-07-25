
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable, slidesTable } from '../db/schema';
import { type UpdateSlideInput } from '../schema';
import { updateSlide } from '../handlers/update_slide';
import { eq } from 'drizzle-orm';

describe('updateSlide', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update slide title', async () => {
    // Create test deck
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Deck'
      })
      .returning()
      .execute();
    const deck = deckResult[0];

    // Create test slide
    const slideResult = await db.insert(slidesTable)
      .values({
        deck_id: deck.id,
        title: 'Original Title',
        body_text: 'Original body',
        image_url: 'http://example.com/image.jpg',
        slide_order: 1
      })
      .returning()
      .execute();
    const slide = slideResult[0];

    const input: UpdateSlideInput = {
      id: slide.id,
      title: 'Updated Title'
    };

    const result = await updateSlide(input);

    expect(result.id).toEqual(slide.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.body_text).toEqual('Original body'); // Unchanged
    expect(result.image_url).toEqual('http://example.com/image.jpg'); // Unchanged
    expect(result.slide_order).toEqual(1); // Unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > slide.updated_at).toBe(true);
  });

  it('should update multiple slide fields', async () => {
    // Create test deck
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Deck'
      })
      .returning()
      .execute();
    const deck = deckResult[0];

    // Create test slide
    const slideResult = await db.insert(slidesTable)
      .values({
        deck_id: deck.id,
        title: 'Original Title',
        body_text: 'Original body',
        image_url: 'http://example.com/original.jpg',
        slide_order: 1
      })
      .returning()
      .execute();
    const slide = slideResult[0];

    const input: UpdateSlideInput = {
      id: slide.id,
      title: 'Updated Title',
      body_text: 'Updated body text',
      image_url: 'http://example.com/updated.jpg',
      slide_order: 2
    };

    const result = await updateSlide(input);

    expect(result.id).toEqual(slide.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.body_text).toEqual('Updated body text');
    expect(result.image_url).toEqual('http://example.com/updated.jpg');
    expect(result.slide_order).toEqual(2);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > slide.updated_at).toBe(true);
  });

  it('should update slide with null values', async () => {
    // Create test deck
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Deck'
      })
      .returning()
      .execute();
    const deck = deckResult[0];

    // Create test slide
    const slideResult = await db.insert(slidesTable)
      .values({
        deck_id: deck.id,
        title: 'Original Title',
        body_text: 'Original body',
        image_url: 'http://example.com/image.jpg',
        slide_order: 1
      })
      .returning()
      .execute();
    const slide = slideResult[0];

    const input: UpdateSlideInput = {
      id: slide.id,
      body_text: null,
      image_url: null
    };

    const result = await updateSlide(input);

    expect(result.id).toEqual(slide.id);
    expect(result.title).toEqual('Original Title'); // Unchanged
    expect(result.body_text).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.slide_order).toEqual(1); // Unchanged
  });

  it('should update parent deck timestamp', async () => {
    // Create test deck
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Deck'
      })
      .returning()
      .execute();
    const originalDeck = deckResult[0];

    // Create test slide
    const slideResult = await db.insert(slidesTable)
      .values({
        deck_id: originalDeck.id,
        title: 'Original Title',
        body_text: 'Original body',
        image_url: 'http://example.com/image.jpg',
        slide_order: 1
      })
      .returning()
      .execute();
    const slide = slideResult[0];

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateSlideInput = {
      id: slide.id,
      title: 'Updated Title'
    };

    await updateSlide(input);

    // Check that deck's updated_at was also updated
    const updatedDecks = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, originalDeck.id))
      .execute();

    const updatedDeck = updatedDecks[0];
    expect(updatedDeck.updated_at).toBeInstanceOf(Date);
    expect(updatedDeck.updated_at > originalDeck.updated_at).toBe(true);
  });

  it('should persist changes to database', async () => {
    // Create test deck
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Deck'
      })
      .returning()
      .execute();
    const deck = deckResult[0];

    // Create test slide
    const slideResult = await db.insert(slidesTable)
      .values({
        deck_id: deck.id,
        title: 'Original Title',
        body_text: 'Original body',
        image_url: 'http://example.com/image.jpg',
        slide_order: 1
      })
      .returning()
      .execute();
    const slide = slideResult[0];

    const input: UpdateSlideInput = {
      id: slide.id,
      title: 'Updated Title',
      body_text: 'Updated body'
    };

    await updateSlide(input);

    // Verify changes were persisted
    const slides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.id, slide.id))
      .execute();

    expect(slides).toHaveLength(1);
    const persistedSlide = slides[0];
    expect(persistedSlide.title).toEqual('Updated Title');
    expect(persistedSlide.body_text).toEqual('Updated body');
    expect(persistedSlide.image_url).toEqual('http://example.com/image.jpg'); // Unchanged
    expect(persistedSlide.slide_order).toEqual(1); // Unchanged
  });

  it('should throw error for non-existent slide', async () => {
    const input: UpdateSlideInput = {
      id: 999,
      title: 'Updated Title'
    };

    await expect(updateSlide(input)).rejects.toThrow(/not found/i);
  });
});
