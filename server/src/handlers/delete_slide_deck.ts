
import { db } from '../db';
import { slideDecksTable } from '../db/schema';
import { type DeleteSlideDeckInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteSlideDeck = async (input: DeleteSlideDeckInput): Promise<{ success: boolean }> => {
  try {
    // Delete the slide deck - CASCADE will automatically delete associated slides
    const result = await db.delete(slideDecksTable)
      .where(eq(slideDecksTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Slide deck deletion failed:', error);
    throw error;
  }
};
