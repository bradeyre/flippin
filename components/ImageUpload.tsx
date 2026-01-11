'use client';

import { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { compressImages } from '@/lib/utils/image-compression';

interface ImageUploadProps {
  onComplete: (urls: string[]) => void;
  onError?: (title: string, message: string) => void;
}

export function ImageUpload({ onComplete, onError }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Create previews
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  }

  async function handleUpload() {
    if (previews.length === 0) {
      if (onError) {
        onError('No Images Selected', 'Please select at least one image');
      } else {
        alert('Please select at least one image');
      }
      return;
    }

    setUploading(true);

    try {
      // Compress images before upload to avoid 413 errors
      const filesToUpload = previews.map(p => p.file);
      const compressedFiles = await compressImages(filesToUpload);
      
      const uploadedUrls: string[] = [];

      for (let i = 0; i < compressedFiles.length; i++) {
        const compressedFile = compressedFiles[i];
        
        // Upload to R2 storage
        const formData = new FormData();
        formData.append('file', compressedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          
          // Handle 413 specifically
          if (uploadResponse.status === 413) {
            throw new Error(
              'Image is too large even after compression. Please try smaller images or fewer photos.'
            );
          }
          
          throw new Error(
            errorData.error || errorData.details || 'Failed to upload image'
          );
        }

        const { url } = await uploadResponse.json();
        if (!url) {
          throw new Error('No URL returned from upload');
        }

        uploadedUrls.push(url);
      }

      onComplete(uploadedUrls);
    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to upload images. Please try again.';
      if (onError) {
        onError('Upload Failed', errorMessage);
      } else {
        alert(`Upload failed: ${errorMessage}`);
      }
      setUploading(false);
    }
  }

  function removePreview(index: number) {
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        id="images"
        multiple
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {previews.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <Camera className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Take or upload photos
              </p>
              <p className="text-sm text-gray-600">
                Upload 3-5 clear photos of your item
              </p>
              <p className="text-xs text-gray-500 mt-2">
                More photos = better offers
              </p>
            </div>
            <button
              type="button"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Choose Photos
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {previews.map((preview, i) => (
              <div key={i} className="relative group">
                <img
                  src={preview.url}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {previews.length < 5 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Add more</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 transition-colors disabled:opacity-50"
            >
              Add More Photos
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                'Continue →'
              )}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            {previews.length} photo{previews.length !== 1 ? 's' : ''} selected
            {previews.length < 3 && ' • Add more for better offers'}
          </p>
        </div>
      )}
    </div>
  );
}
