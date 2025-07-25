
import { db } from '../db';
import { slideDecksTable, slidesTable } from '../db/schema';
import { type GetSlideDeckInput, type SlideDeckWithSlides } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getSlideDeckWithSlides = async (input: GetSlideDeckInput): Promise<SlideDeckWithSlides | null> => {
  try {
    // First, get the slide deck
    const deckResults = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, input.id))
      .execute();

    if (deckResults.length === 0) {
      return null;
    }

    const deck = deckResults[0];

    // Get all slides for this deck, ordered by slide_order ascending
    const slides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.deck_id, input.id))
      .orderBy(asc(slidesTable.slide_order))
      .execute();

    return {
      id: deck.id,
      name: deck.name,
      created_at: deck.created_at,
      updated_at: deck.updated_at,
      slides: slides
    };
  } catch (error) {
    console.error('Failed to get slide deck with slides:', error);
    throw error;
  }
};
