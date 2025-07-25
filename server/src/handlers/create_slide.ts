
import { db } from '../db';
import { slidesTable, slideDecksTable } from '../db/schema';
import { type CreateSlideInput, type Slide } from '../schema';
import { eq } from 'drizzle-orm';

export const createSlide = async (input: CreateSlideInput): Promise<Slide> => {
  try {
    // Verify the deck exists first to prevent foreign key constraint violations
    const existingDeck = await db.select()
      .from(slideDecksTable)
      .where(eq(slideDecksTable.id, input.deck_id))
      .execute();

    if (existingDeck.length === 0) {
      throw new Error(`Slide deck with id ${input.deck_id} not found`);
    }

    // Insert slide record
    const result = await db.insert(slidesTable)
      .values({
        deck_id: input.deck_id,
        title: input.title,
        body_text: input.body_text || null,
        image_url: input.image_url || null,
        slide_order: input.slide_order
      })
      .returning()
      .execute();

    // Update the parent deck's updated_at timestamp
    await db.update(slideDecksTable)
      .set({ updated_at: new Date() })
      .where(eq(slideDecksTable.id, input.deck_id))
      .execute();

    return result[0];
  } catch (error) {
    console.error('Slide creation failed:', error);
    throw error;
  }
};
