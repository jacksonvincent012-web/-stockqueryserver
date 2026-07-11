import React, { useRef, useState } from 'react';
import { Upload, Camera, X, User } from 'lucide-react';

interface ProfilePhotoUploadProps {
  photoURL: string | null;
  setPhotoURL: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfilePhotoUpload({ photoURL, setPhotoURL, size = 'md' }: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(photoURL);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    
    setError('');
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      const minSize = Math.min(img.width, img.height);
      canvas.width = minSize;
      canvas.height = minSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const xOffset = (img.width - minSize) / 2;
      const yOffset = (img.height - minSize) / 2;
      ctx.drawImage(img, xOffset, yOffset, minSize, minSize, 0, 0, minSize, minSize);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPreview(dataUrl);
      setPhotoURL(dataUrl);
    } catch (err) {
      setError('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    setPhotoURL('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const dimensions = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  }[size];

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-4">
        <div className={`relative ${dimensions} rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0`}>
          {preview ? (
            <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <User className="w-1/2 h-1/2 text-slate-400" />
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              Upload Photo
            </button>
            {preview && (
              <button
                type="button"
                onClick={clearPhoto}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 max-w-[200px]">
            JPG, PNG, WEBP max 5MB. Automatically cropped to square.
          </p>
          {error && <p className="text-[10px] text-rose-600 mt-1">{error}</p>}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
}
