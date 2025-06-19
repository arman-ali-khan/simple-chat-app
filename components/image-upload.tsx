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
      <div className="flex flex-col gap-2 p-3 bg-white rounded-lg border">
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSendImage}
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Send
          </Button>
          <Button
            onClick={handleCancel}
            size="sm"
            variant="outline"
            className="px-2"
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
        className="rounded-full w-11 h-11 p-0"
      >
        <ImagePlus className="w-4 h-4" />
      </Button>
    </>
  );
}