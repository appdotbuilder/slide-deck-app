
import { db } from '../db';
import { slideDecksTable } from '../db/schema';
import { type SlideDeck } from '../schema';
import { desc } from 'drizzle-orm';

export const getSlideDecks = async (): Promise<SlideDeck[]> => {
  try {
    const results = await db.select()
      .from(slideDecksTable)
      .orderBy(desc(slideDecksTable.updated_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch slide decks:', error);
    throw error;
  }
};
