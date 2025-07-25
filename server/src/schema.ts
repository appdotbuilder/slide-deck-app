
import { z } from 'zod';

// Slide Deck schema
export const slideDeckSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type SlideDeck = z.infer<typeof slideDeckSchema>;

// Input schema for creating slide decks
export const createSlideDeckInputSchema = z.object({
  name: z.string().min(1, "Deck name is required")
});

export type CreateSlideDeckInput = z.infer<typeof createSlideDeckInputSchema>;

// Input schema for updating slide decks
export const updateSlideDeckInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Deck name is required")
});

export type UpdateSlideDeckInput = z.infer<typeof updateSlideDeckInputSchema>;

// Slide schema
export const slideSchema = z.object({
  id: z.number(),
  deck_id: z.number(),
  title: z.string(),
  body_text: z.string().nullable(),
  image_url: z.string().nullable(),
  slide_order: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Slide = z.infer<typeof slideSchema>;

// Input schema for creating slides
export const createSlideInputSchema = z.object({
  deck_id: z.number(),
  title: z.string().min(1, "Slide title is required"),
  body_text: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  slide_order: z.number().int().nonnegative()
});

export type CreateSlideInput = z.infer<typeof createSlideInputSchema>;

// Input schema for updating slides
export const updateSlideInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Slide title is required").optional(),
  body_text: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  slide_order: z.number().int().nonnegative().optional()
});

export type UpdateSlideInput = z.infer<typeof updateSlideInputSchema>;

// Schema for getting slides by deck ID
export const getSlidesInputSchema = z.object({
  deck_id: z.number()
});

export type GetSlidesInput = z.infer<typeof getSlidesInputSchema>;

// Schema for getting a single slide deck
export const getSlideDeckInputSchema = z.object({
  id: z.number()
});

export type GetSlideDeckInput = z.infer<typeof getSlideDeckInputSchema>;

// Schema for deleting a slide deck
export const deleteSlideDeckInputSchema = z.object({
  id: z.number()
});

export type DeleteSlideDeckInput = z.infer<typeof deleteSlideDeckInputSchema>;

// Schema for deleting a slide
export const deleteSlideInputSchema = z.object({
  id: z.number()
});

export type DeleteSlideInput = z.infer<typeof deleteSlideInputSchema>;

// Complete slide deck with slides (for presentation mode)
export const slideDeckWithSlidesSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  slides: z.array(slideSchema)
});

export type SlideDeckWithSlides = z.infer<typeof slideDeckWithSlidesSchema>;
