
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createSlideDeckInputSchema,
  updateSlideDeckInputSchema,
  getSlideDeckInputSchema,
  deleteSlideDeckInputSchema,
  createSlideInputSchema,
  updateSlideInputSchema,
  deleteSlideInputSchema,
  getSlidesInputSchema
} from './schema';

// Import handlers
import { getSlideDecks } from './handlers/get_slide_decks';
import { createSlideDeck } from './handlers/create_slide_deck';
import { getSlideDeck } from './handlers/get_slide_deck';
import { updateSlideDeck } from './handlers/update_slide_deck';
import { deleteSlideDeck } from './handlers/delete_slide_deck';
import { getSlides } from './handlers/get_slides';
import { createSlide } from './handlers/create_slide';
import { updateSlide } from './handlers/update_slide';
import { deleteSlide } from './handlers/delete_slide';
import { getSlideDeckWithSlides } from './handlers/get_slide_deck_with_slides';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Slide Deck operations
  getSlideDecks: publicProcedure
    .query(() => getSlideDecks()),
  
  createSlideDeck: publicProcedure
    .input(createSlideDeckInputSchema)
    .mutation(({ input }) => createSlideDeck(input)),
  
  getSlideDeck: publicProcedure
    .input(getSlideDeckInputSchema)
    .query(({ input }) => getSlideDeck(input)),
  
  updateSlideDeck: publicProcedure
    .input(updateSlideDeckInputSchema)
    .mutation(({ input }) => updateSlideDeck(input)),
  
  deleteSlideDeck: publicProcedure
    .input(deleteSlideDeckInputSchema)
    .mutation(({ input }) => deleteSlideDeck(input)),

  // Slide operations
  getSlides: publicProcedure
    .input(getSlidesInputSchema)
    .query(({ input }) => getSlides(input)),
  
  createSlide: publicProcedure
    .input(createSlideInputSchema)
    .mutation(({ input }) => createSlide(input)),
  
  updateSlide: publicProcedure
    .input(updateSlideInputSchema)
    .mutation(({ input }) => updateSlide(input)),
  
  deleteSlide: publicProcedure
    .input(deleteSlideInputSchema)
    .mutation(({ input }) => deleteSlide(input)),

  // Special endpoint for presentation mode - eagerly loads all slide data
  getSlideDeckWithSlides: publicProcedure
    .input(getSlideDeckInputSchema)
    .query(({ input }) => getSlideDeckWithSlides(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
