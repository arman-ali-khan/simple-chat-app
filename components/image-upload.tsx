import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageData: string, imageUrl: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageUpload, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendImage = () => {
    if (preview) {
      onImageUpload(preview, preview);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (preview) {
    return (
      <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white rounded-lg border shadow-lg z-20">
        <img
          src={preview}
          alt="Preview"
          className="w-full max-w-32 h-32 object-cover rounded-lg mx-auto"
        />
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleSendImage}
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 touch-manipulation"
          >
            Send
          </Button>
          <Button
            onClick={handleCancel}
            size="sm"
            variant="outline"
            className="px-2 touch-manipulation"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="hidden"
        disabled={disabled}
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        variant="outline"
        className="rounded-full w-11 h-11 p-0 touch-manipulation"
      >
        <ImagePlus className="w-4 h-4" />
      </Button>
    </>
  );
}