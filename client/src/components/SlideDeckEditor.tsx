
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, PlusCircle, Play, Edit, Trash2 } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { SlideDeck, Slide, CreateSlideInput, UpdateSlideDeckInput } from '../../../server/src/schema';

interface SlideDeckEditorProps {
  deck: SlideDeck;
  onBack: () => void;
  onSlideSelect: (slide: Slide) => void;
  onPresentDeck: () => void;
}

export function SlideDeckEditor({ deck, onBack, onSlideSelect, onPresentDeck }: SlideDeckEditorProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentDeck, setCurrentDeck] = useState<SlideDeck>(deck);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateSlideDialogOpen, setIsCreateSlideDialogOpen] = useState(false);
  const [deckNameEdit, setDeckNameEdit] = useState(deck.name);
  const [newSlideData, setNewSlideData] = useState<CreateSlideInput>({
    deck_id: deck.id,
    title: '',
    body_text: null,
    image_url: null,
    slide_order: 0
  });

  const loadSlides = useCallback(async () => {
    try {
      const result = await trpc.getSlides.query({ deck_id: deck.id });
      setSlides(result);
      // Update slide order for new slides
      setNewSlideData((prev: CreateSlideInput) => ({ 
        ...prev, 
        slide_order: result.length 
      }));
    } catch (error) {
      console.error('Failed to load slides:', error);
    }
  }, [deck.id]);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const handleUpdateDeckName = async () => {
    if (deckNameEdit.trim() === currentDeck.name) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateSlideDeckInput = {
        id: currentDeck.id,
        name: deckNameEdit.trim()
      };
      const updatedDeck = await trpc.updateSlideDeck.mutate(updateData);
      setCurrentDeck(updatedDeck);
    } catch (error) {
      console.error('Failed to update deck name:', error);
      setDeckNameEdit(currentDeck.name); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideData.title.trim()) return;

    setIsLoading(true);
    try {
      const newSlide = await trpc.createSlide.mutate(newSlideData);
      setSlides((prev: Slide[]) => [...prev, newSlide]);
      setNewSlideData({
        deck_id: deck.id,
        title: '',
        body_text: null,
        image_url: null,
        slide_order: slides.length + 1
      });
      setIsCreateSlideDialogOpen(false);
    } catch (error) {
      console.error('Failed to create slide:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSlide = async (slideId: number) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      await trpc.deleteSlide.mutate({ id: slideId });
      setSlides((prev: Slide[]) => prev.filter(slide => slide.id !== slideId));
    } catch (error) {
      console.error('Failed to delete slide:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Decks
          </Button>
          <div className="flex items-center space-x-2">
            <Input
              value={deckNameEdit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckNameEdit(e.target.value)}
              onBlur={handleUpdateDeckName}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  handleUpdateDeckName();
                }
              }}
              className="text-2xl font-bold border-none px-0 focus:ring-0 bg-transparent"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Dialog open={isCreateSlideDialogOpen} onOpenChange={setIsCreateSlideDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Slide</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSlide} className="space-y-4">
                <Input
                  placeholder="Slide title..."
                  value={newSlideData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewSlideData((prev: CreateSlideInput) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateSlideDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Add Slide'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button onClick={onPresentDeck} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Present
          </Button>
        </div>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No slides yet</h2>
          <p className="text-gray-500 mb-6">Add your first slide to start building your presentation</p>
          <Button 
            onClick={() => setIsCreateSlideDialogOpen(true)} 
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add First Slide
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {slides.map((slide: Slide, index: number) => (
            <Card key={slide.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Slide {index + 1}</div>
                    <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {slide.title}
                    </CardTitle>
                  </div>
                  <Button
                    onClick={() => handleDeleteSlide(slide.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                {slide.body_text && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                    {slide.body_text}
                  </p>
                )}
                {slide.image_url && (
                  <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
                    🖼️ Image attached
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Updated: {slide.updated_at.toLocaleDateString()}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button
                  onClick={() => onSlideSelect(slide)}
                  className="w-full"
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Slide
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
