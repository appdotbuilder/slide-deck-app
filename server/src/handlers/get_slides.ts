
import { db } from '../db';
import { slidesTable } from '../db/schema';
import { type GetSlidesInput, type Slide } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getSlides = async (input: GetSlidesInput): Promise<Slide[]> => {
  try {
    const results = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.deck_id, input.deck_id))
      .orderBy(asc(slidesTable.slide_order))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get slides:', error);
    throw error;
  }
};
