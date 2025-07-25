
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { SlideDeckWithSlides } from '../../../server/src/schema';

interface PresentationModeProps {
  presentationData: SlideDeckWithSlides;
  onExit: () => void;
}

export function PresentationMode({ presentationData, onExit }: PresentationModeProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = presentationData.slides;

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev: number) => 
      prev > 0 ? prev - 1 : slides.length - 1
    );
  }, [slides.length]);

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev: number) => 
      prev < slides.length - 1 ? prev + 1 : 0
    );
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goToPrevSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // Spacebar
          e.preventDefault();
          goToNextSlide();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevSlide, goToNextSlide, onExit]);

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold mb-4">No slides to present</h2>
          <p className="text-gray-300 mb-6">Add some slides to your deck first</p>
          <Button onClick={onExit} variant="outline" className="text-black">
            Exit Presentation
          </Button>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <div className="text-white/80">
          <span className="text-sm">
            {presentationData.name} • Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={goToPrevSlide}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            disabled={slides.length <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={goToNextSlide}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            disabled={slides.length <= 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-white/20 mx-2" />
          
          <Button
            onClick={onExit}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main slide content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-6xl font-bold mb-8 leading-tight">
            {currentSlide.title}
          </h1>
          
          {currentSlide.image_url && (
            <div className="mb-8">
              <img
                src={currentSlide.image_url}
                alt="Slide"
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}
          
          {currentSlide.body_text && (
            <div className="text-2xl leading-relaxed text-white/90 whitespace-pre-wrap max-w-3xl mx-auto">
              {currentSlide.body_text}
            </div>
          )}
        </div>
      </div>

      {/* Navigation hints */}
      <div className="text-center p-4 text-white/60 text-sm">
        Use arrow keys, spacebar to navigate • ESC to exit
      </div>

      {/* Click areas for navigation */}
      <div 
        className="absolute left-0 top-0 w-1/3 h-full cursor-pointer"
        onClick={goToPrevSlide}
        title="Previous slide"
      />
      <div 
        className="absolute right-0 top-0 w-1/3 h-full cursor-pointer"
        onClick={goToNextSlide}
        title="Next slide"
      />
    </div>
  );
}
