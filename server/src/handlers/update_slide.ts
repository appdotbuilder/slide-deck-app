
import { db } from '../db';
import { slidesTable, slideDecksTable } from '../db/schema';
import { type UpdateSlideInput, type Slide } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const updateSlide = async (input: UpdateSlideInput): Promise<Slide> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: sql`NOW()`
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.body_text !== undefined) {
      updateData.body_text = input.body_text;
    }
    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url;
    }
    if (input.slide_order !== undefined) {
      updateData.slide_order = input.slide_order;
    }

    // Update the slide
    const result = await db.update(slidesTable)
      .set(updateData)
      .where(eq(slidesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Slide with id ${input.id} not found`);
    }

    const updatedSlide = result[0];

    // Update the parent deck's updated_at timestamp
    await db.update(slideDecksTable)
      .set({ updated_at: sql`NOW()` })
      .where(eq(slideDecksTable.id, updatedSlide.deck_id))
      .execute();

    return updatedSlide;
  } catch (error) {
    console.error('Slide update failed:', error);
    throw error;
  }
};
