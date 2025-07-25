
import { db } from '../db';
import { slideDecksTable } from '../db/schema';
import { type GetSlideDeckInput, type SlideDeck } from '../schema';
import { eq } from 'drizzle-orm';

export const getSlideDeck = async (input: GetSlideDeckInput): Promise<SlideDeck | null> => {
  try {
    const result = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Failed to fetch slide deck:', error);
    throw error;
  }
};
