
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CreateNoteInput } from '../../../server/src/schema';

interface NewNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateNoteInput) => Promise<void>;
  isLoading?: boolean;
}

export function NewNoteDialog({ open, onOpenChange, onSubmit, isLoading = false }: NewNoteDialogProps) {
  const [formData, setFormData] = useState<CreateNoteInput>({
    title: '',
    content: '',
    position_x: Math.floor(Math.random() * 200), // Random initial position
    position_y: Math.floor(Math.random() * 200),
    width: 300,
    height: 200
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await onSubmit({
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim()
      });
      // Reset form
      setFormData({
        title: '',
        content: '',
        position_x: Math.floor(Math.random() * 200),
        position_y: Math.floor(Math.random() * 200),
        width: 300,
        height: 200
      });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      content: '',
      position_x: Math.floor(Math.random() * 200),
      position_y: Math.floor(Math.random() * 200),
      width: 300,
      height: 200
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Create New Note</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new note to your collection. You can drag and resize it after creation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Note title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateNoteInput) => ({ ...prev, title: e.target.value }))
              }
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500"
              disabled={isLoading}
              autoFocus
              required
            />
          </div>
          
          <div className="space-y-2">
            <Textarea
              placeholder="Write your note content here... (optional)"
              value={formData.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateNoteInput) => ({ ...prev, content: e.target.value }))
              }
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 min-h-[100px] resize-none"
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {isLoading ? 'Creating...' : 'Create Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
