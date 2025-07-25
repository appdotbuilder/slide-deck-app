
import { db } from '../db';
import { slidesTable, slideDecksTable } from '../db/schema';
import { type DeleteSlideInput } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const deleteSlide = async (input: DeleteSlideInput): Promise<{ success: boolean }> => {
  try {
    // First, get the deck_id of the slide to be deleted
    const slideToDelete = await db.select({ deck_id: slidesTable.deck_id })
      .from(slidesTable)
      .where(eq(slidesTable.id, input.id))
      .execute();

    if (slideToDelete.length === 0) {
      throw new Error(`Slide with id ${input.id} not found`);
    }

    const deckId = slideToDelete[0].deck_id;

    // Delete the slide
    const deleteResult = await db.delete(slidesTable)
      .where(eq(slidesTable.id, input.id))
      .execute();

    // Update the parent deck's updated_at timestamp
    await db.update(slideDecksTable)
      .set({ updated_at: sql`now()` })
      .where(eq(slideDecksTable.id, deckId))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Slide deletion failed:', error);
    throw error;
  }
};
