
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Slide, SlideDeck, UpdateSlideInput } from '../../../server/src/schema';

interface SlideEditorProps {
  slide: Slide;
  deck: SlideDeck;
  onBack: () => void;
}

export function SlideEditor({ slide, deck, onBack }: SlideEditorProps) {
  const [slideData, setSlideData] = useState({
    title: slide.title,
    body_text: slide.body_text || '',
    image_url: slide.image_url || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleFieldChange = useCallback((field: keyof typeof slideData, value: string) => {
    setSlideData((prev: typeof slideData) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData: UpdateSlideInput = {
        id: slide.id,
        title: slideData.title,
        body_text: slideData.body_text || null,
        image_url: slideData.image_url || null
      };
      await trpc.updateSlide.mutate(updateData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update slide:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Note: This is a stub implementation for image upload
      // In a real application, you would upload the file to a server or cloud storage
      const imageUrl = URL.createObjectURL(file);
      handleFieldChange('image_url', imageUrl);
      console.log('Image upload stub: In a real app, upload file to server and get URL');
    }
  };

  const removeImage = () => {
    handleFieldChange('image_url', '');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {deck.name}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Slide</h1>
            <p className="text-gray-600">Customize your slide content</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !hasUnsavedChanges}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Slide Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slide Title
                </label>
                <Input
                  value={slideData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleFieldChange('title', e.target.value)
                  }
                  placeholder="Enter slide title..."
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Text
                </label>
                <Textarea
                  value={slideData.body_text}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleFieldChange('body_text', e.target.value)
                  }
                  placeholder="Enter slide content..."
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                {slideData.image_url ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={slideData.image_url}
                        alt="Slide"
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                      <Button
                        onClick={removeImage}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={slideData.image_url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleFieldChange('image_url', e.target.value)
                      }
                      placeholder="Or enter image URL..."
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Upload an image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Choose file
                      </label>
                    </div>
                    <div className="text-center text-gray-500">or</div>
                    <Input
                      value={slideData.image_url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleFieldChange('image_url', e.target.value)
                      }
                      placeholder="Enter image URL..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg shadow-sm p-8 min-h-96">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  {slideData.title || 'Slide Title'}
                </h2>
                
                {slideData.image_url && (
                  <div className="mb-6">
                    <img
                      src={slideData.image_url}
                      alt="Slide"
                      className="w-full max-h-48 object-contain rounded-lg"
                    />
                  </div>
                )}
                
                {slideData.body_text && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {slideData.body_text}
                  </div>
                )}
                
                {!slideData.body_text && !slideData.image_url && (
                  <div className="text-center text-gray-400 mt-12">
                    Add content to see preview
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-orange-600 text-sm">
                  You have unsaved changes
                </div>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Save Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
