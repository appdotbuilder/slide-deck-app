
import { db } from '../db';
import { slideDecksTable } from '../db/schema';
import { type UpdateSlideDeckInput, type SlideDeck } from '../schema';
import { eq } from 'drizzle-orm';

export const updateSlideDeck = async (input: UpdateSlideDeckInput): Promise<SlideDeck> => {
  try {
    // Update slide deck record
    const result = await db.update(slideDecksTable)
      .set({
        name: input.name,
        updated_at: new Date() // Explicitly update the timestamp
      })
      .where(eq(slideDecksTable.id, input.id))
      .returning()
      .execute();

    // Check if deck was found and updated
    if (result.length === 0) {
      throw new Error(`Slide deck with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Slide deck update failed:', error);
    throw error;
  }
};
