
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { NoteCard } from '@/components/NoteCard';
import { NewNoteDialog } from '@/components/NewNoteDialog';
import type { Note, CreateNoteInput, UpdateNoteInput } from '../../server/src/schema';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      const result = await trpc.getNotes.query();
      setNotes(result);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async (input: CreateNoteInput) => {
    setIsLoading(true);
    try {
      const newNote = await trpc.createNote.mutate(input);
      setNotes((prev: Note[]) => [...prev, newNote]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async (input: UpdateNoteInput) => {
    try {
      const updatedNote = await trpc.updateNote.mutate(input);
      setNotes((prev: Note[]) => 
        prev.map((note: Note) => note.id === updatedNote.id ? updatedNote : note)
      );
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await trpc.deleteNote.mutate({ id });
      setNotes((prev: Note[]) => prev.filter((note: Note) => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleDragStart = (note: Note) => {
    setDraggedNote(note);
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedNote) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      await trpc.updateNotePosition.mutate({
        id: draggedNote.id,
        position_x: Math.max(0, x - 150), // Center the note on cursor
        position_y: Math.max(0, y - 100),
      });
      
      // Update local state
      setNotes((prev: Note[]) =>
        prev.map((note: Note) =>
          note.id === draggedNote.id
            ? { ...note, position_x: Math.max(0, x - 150), position_y: Math.max(0, y - 100) }
            : note
        )
      );
    } catch (error) {
      console.error('Failed to update note position:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-100">My Notes</h1>
              <span className="text-sm text-gray-500">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No notes yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first note to get started organizing your thoughts.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first note
            </Button>
          </div>
        ) : (
          <div 
            className="relative min-h-[600px] bg-gray-900/20 rounded-lg border border-gray-800 overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="w-full h-full" 
                style={{
                  backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />
            </div>

            {/* Notes */}
            {notes.map((note: Note) => (
              <div
                key={note.id}
                className="absolute transition-all duration-200 ease-out"
                style={{
                  left: `${note.position_x}px`,
                  top: `${note.position_y}px`,
                  width: `${note.width}px`,
                  height: `${note.height}px`,
                  zIndex: draggedNote?.id === note.id ? 50 : 10,
                }}
              >
                <NoteCard
                  note={note}
                  onUpdate={handleUpdateNote}
                  onDelete={handleDeleteNote}
                  onDragStart={() => handleDragStart(note)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedNote?.id === note.id}
                />
              </div>
            ))}

            {/* Drop Zone Indicator */}
            {draggedNote && (
              <div className="absolute inset-0 bg-blue-500/5 border-2 border-dashed border-blue-500/30 rounded-lg pointer-events-none" />
            )}
          </div>
        )}
      </div>

      {/* New Note Dialog */}
      <NewNoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateNote}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
