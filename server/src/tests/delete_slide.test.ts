
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slideDecksTable, slidesTable } from '../db/schema';
import { type DeleteSlideInput } from '../schema';
import { deleteSlide } from '../handlers/delete_slide';
import { eq } from 'drizzle-orm';

// Test input
const testInput: DeleteSlideInput = {
  id: 1
};

describe('deleteSlide', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a slide successfully', async () => {
    // Create a test deck first
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Deck'
      })
      .returning()
      .execute();

    const deckId = deckResult[0].id;

    // Create a test slide
    const slideResult = await db.insert(slidesTable)
      .values({
        deck_id: deckId,
        title: 'Test Slide',
        body_text: 'Test content',
        image_url: null,
        slide_order: 1
      })
      .returning()
      .execute();

    const slideId = slideResult[0].id;

    // Delete the slide
    const result = await deleteSlide({ id: slideId });

    // Verify the response
    expect(result.success).toBe(true);

    // Verify the slide was deleted from database
    const deletedSlide = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.id, slideId))
      .execute();

    expect(deletedSlide).toHaveLength(0);
  });

  it('should update parent deck updated_at timestamp', async () => {
    // Create a test deck first
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Deck'
      })
      .returning()
      .execute();

    const deckId = deckResult[0].id;
    const originalUpdatedAt = deckResult[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create a test slide
    const slideResult = await db.insert(slidesTable)
      .values({
        deck_id: deckId,
        title: 'Test Slide',
        body_text: 'Test content',
        image_url: null,
        slide_order: 1
      })
      .returning()
      .execute();

    const slideId = slideResult[0].id;

    // Delete the slide
    await deleteSlide({ id: slideId });

    // Check that the deck's updated_at timestamp was updated
    const updatedDeck = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, deckId))
      .execute();

    expect(updatedDeck).toHaveLength(1);
    expect(updatedDeck[0].updated_at).toBeInstanceOf(Date);
    expect(updatedDeck[0].updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error when slide does not exist', async () => {
    const nonExistentId = 99999;

    await expect(deleteSlide({ id: nonExistentId }))
      .rejects.toThrow(/Slide with id 99999 not found/);
  });

  it('should handle multiple slides in same deck correctly', async () => {
    // Create a test deck first
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: 'Test Deck'
      })
      .returning()
      .execute();

    const deckId = deckResult[0].id;

    // Create multiple test slides
    const slide1Result = await db.insert(slidesTable)
      .values({
        deck_id: deckId,
        title: 'Slide 1',
        body_text: 'Content 1',
        image_url: null,
        slide_order: 1
      })
      .returning()
      .execute();

    const slide2Result = await db.insert(slidesTable)
      .values({
        deck_id: deckId,
        title: 'Slide 2',
        body_text: 'Content 2',
        image_url: null,
        slide_order: 2
      })
      .returning()
      .execute();

    const slide1Id = slide1Result[0].id;
    const slide2Id = slide2Result[0].id;

    // Delete one slide
    const result = await deleteSlide({ id: slide1Id });

    expect(result.success).toBe(true);

    // Verify only the targeted slide was deleted
    const remainingSlides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.deck_id, deckId))
      .execute();

    expect(remainingSlides).toHaveLength(1);
    expect(remainingSlides[0].id).toBe(slide2Id);
    expect(remainingSlides[0].title).toBe('Slide 2');
  });
});
