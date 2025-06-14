
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GripVertical, Edit3, Trash2, Check, X } from 'lucide-react';
import type { Note, UpdateNoteInput } from '../../../server/src/schema';

interface NoteCardProps {
  note: Note;
  onUpdate: (input: UpdateNoteInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

export function NoteCard({ note, onUpdate, onDelete, onDragStart, onDragEnd, isDragging = false }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    
    setIsUpdating(true);
    try {
      await onUpdate({
        id: note.id,
        title: editTitle.trim(),
        content: editContent.trim()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await onDelete(note.id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    onDragStart();
  };

  return (
    <Card 
      className={`h-full bg-gray-900 border-gray-700 overflow-hidden group hover:border-gray-600 transition-all duration-200 ${
        isDragging ? 'opacity-70 shadow-2xl scale-105 rotate-1' : 'hover:shadow-lg'
      }`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Header with drag handle and actions */}
      <div className="drag-handle flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50 cursor-move">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">
            {note.updated_at.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                className="h-7 w-7 p-0 hover:bg-gray-700"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-red-900/20 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-100">Delete Note</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete "{note.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveEdit}
                disabled={isUpdating || !editTitle.trim()}
                className="h-7 w-7 p-0 hover:bg-green-900/20 text-green-400 hover:text-green-300"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="h-7 w-7 p-0 hover:bg-gray-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 h-full flex flex-col">
        {isEditing ? (
          <div className="space-y-3 flex-1 flex flex-col">
            <Input
              value={editTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
              placeholder="Note title"
              className="bg-gray-800 border-gray-600 text-gray-100 text-sm font-medium"
              disabled={isUpdating}
            />
            <Textarea
              value={editContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
              placeholder="Write your note content here..."
              className="bg-gray-800 border-gray-600 text-gray-300 text-sm flex-1 resize-none"
              disabled={isUpdating}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <h3 className="font-medium text-gray-100 text-sm mb-2 line-clamp-2">
              {note.title}
            </h3>
            {note.content && (
              <p className="text-gray-400 text-xs leading-relaxed flex-1 overflow-hidden">
                {note.content}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
