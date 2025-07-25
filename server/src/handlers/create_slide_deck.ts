
import { db } from '../db';
import { slideDecksTable, slidesTable } from '../db/schema';
import { type CreateSlideDeckInput, type SlideDeck } from '../schema';

export const createSlideDeck = async (input: CreateSlideDeckInput): Promise<SlideDeck> => {
  try {
    // Create the slide deck
    const deckResult = await db.insert(slideDecksTable)
      .values({
        name: input.name
      })
      .returning()
      .execute();

    const slideDeck = deckResult[0];

    // Create a default first slide for the new deck
    await db.insert(slidesTable)
      .values({
        deck_id: slideDeck.id,
        title: 'First Slide',
        body_text: null,
        image_url: null,
        slide_order: 1
      })
      .execute();

    return slideDeck;
  } catch (error) {
    console.error('Slide deck creation failed:', error);
    throw error;
  }
};
