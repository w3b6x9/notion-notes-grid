
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createNoteInputSchema, 
  updateNoteInputSchema, 
  deleteNoteInputSchema,
  updateNotePositionInputSchema 
} from './schema';
import { createNote } from './handlers/create_note';
import { getNotes } from './handlers/get_notes';
import { updateNote } from './handlers/update_note';
import { deleteNote } from './handlers/delete_note';
import { updateNotePosition } from './handlers/update_note_position';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Note management endpoints
  createNote: publicProcedure
    .input(createNoteInputSchema)
    .mutation(({ input }) => createNote(input)),
    
  getNotes: publicProcedure
    .query(() => getNotes()),
    
  updateNote: publicProcedure
    .input(updateNoteInputSchema)
    .mutation(({ input }) => updateNote(input)),
    
  deleteNote: publicProcedure
    .input(deleteNoteInputSchema)
    .mutation(({ input }) => deleteNote(input)),
    
  updateNotePosition: publicProcedure
    .input(updateNotePositionInputSchema)
    .mutation(({ input }) => updateNotePosition(input)),
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
