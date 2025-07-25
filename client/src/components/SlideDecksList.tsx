
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Play, Edit } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { SlideDeck, CreateSlideDeckInput } from '../../../server/src/schema';

interface SlideDecksListProps {
  onDeckSelect: (deck: SlideDeck) => void;
  onPresentDeck: (deck: SlideDeck) => void;
}

export function SlideDecksList({ onDeckSelect, onPresentDeck }: SlideDecksListProps) {
  const [decks, setDecks] = useState<SlideDeck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDeckData, setNewDeckData] = useState<CreateSlideDeckInput>({
    name: ''
  });

  const loadDecks = useCallback(async () => {
    try {
      const result = await trpc.getSlideDecks.query();
      setDecks(result);
    } catch (error) {
      console.error('Failed to load slide decks:', error);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckData.name.trim()) return;

    setIsLoading(true);
    try {
      const newDeck = await trpc.createSlideDeck.mutate(newDeckData);
      setDecks((prev: SlideDeck[]) => [newDeck, ...prev]);
      setNewDeckData({ name: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create slide deck:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 My Slide Decks</h1>
          <p className="text-gray-600">Create and manage your presentation decks</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="w-5 h-5 mr-2" />
              New Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Slide Deck</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <Input
                placeholder="Enter deck name..."
                value={newDeckData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewDeckData((prev: CreateSlideDeckInput) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Deck'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No slide decks yet</h2>
          <p className="text-gray-500 mb-6">Create your first presentation deck to get started</p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create First Deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {decks.map((deck: SlideDeck) => (
            <Card key={deck.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {deck.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-sm text-gray-500">
                  <div>Created: {deck.created_at.toLocaleDateString()}</div>
                  <div>Updated: {deck.updated_at.toLocaleDateString()}</div>
                </div>
              </CardContent>
              <CardFooter className="flex space-x-2 pt-3">
                <Button
                  onClick={() => onDeckSelect(deck)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => onPresentDeck(deck)}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Present
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
