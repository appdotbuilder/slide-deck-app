
import { useState, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { SlideDecksList } from '@/components/SlideDecksList';
import { SlideDeckEditor } from '@/components/SlideDeckEditor';
import { SlideEditor } from '@/components/SlideEditor';
import { PresentationMode } from '@/components/PresentationMode';
import type { SlideDeck, Slide, SlideDeckWithSlides } from '../../server/src/schema';

type ViewMode = 'list' | 'deck-editor' | 'slide-editor' | 'presentation';

interface AppState {
  viewMode: ViewMode;
  selectedDeck: SlideDeck | null;
  selectedSlide: Slide | null;
  presentationData: SlideDeckWithSlides | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    viewMode: 'list',
    selectedDeck: null,
    selectedSlide: null,
    presentationData: null
  });

  const navigateToList = useCallback(() => {
    setState({
      viewMode: 'list',
      selectedDeck: null,
      selectedSlide: null,
      presentationData: null
    });
  }, []);

  const navigateToDeckEditor = useCallback((deck: SlideDeck) => {
    setState(prev => ({
      ...prev,
      viewMode: 'deck-editor',
      selectedDeck: deck,
      selectedSlide: null,
      presentationData: null
    }));
  }, []);

  const navigateToSlideEditor = useCallback((slide: Slide) => {
    setState(prev => ({
      ...prev,
      viewMode: 'slide-editor',
      selectedSlide: slide
    }));
  }, []);

  const navigateToPresentation = useCallback(async (deck: SlideDeck) => {
    try {
      // Eagerly load all slide data for presentation mode
      const presentationData = await trpc.getSlideDeckWithSlides.query({ id: deck.id });
      if (presentationData) {
        setState(prev => ({
          ...prev,
          viewMode: 'presentation',
          selectedDeck: deck,
          presentationData
        }));
      }
    } catch (error) {
      console.error('Failed to load presentation data:', error);
    }
  }, []);

  const renderCurrentView = () => {
    switch (state.viewMode) {
      case 'list':
        return (
          <SlideDecksList
            onDeckSelect={navigateToDeckEditor}
            onPresentDeck={navigateToPresentation}
          />
        );
      
      case 'deck-editor':
        return state.selectedDeck ? (
          <SlideDeckEditor
            deck={state.selectedDeck}
            onBack={navigateToList}
            onSlideSelect={navigateToSlideEditor}
            onPresentDeck={() => navigateToPresentation(state.selectedDeck!)}
          />
        ) : null;
      
      case 'slide-editor':
        return state.selectedSlide && state.selectedDeck ? (
          <SlideEditor
            slide={state.selectedSlide}
            deck={state.selectedDeck}
            onBack={() => navigateToDeckEditor(state.selectedDeck!)}
          />
        ) : null;
      
      case 'presentation':
        return state.presentationData ? (
          <PresentationMode
            presentationData={state.presentationData}
            onExit={() => navigateToDeckEditor(state.selectedDeck!)}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {renderCurrentView()}
    </div>
  );
}

export default App;
