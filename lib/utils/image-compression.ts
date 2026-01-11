/**
 * Client-side image compression utility
 * Compresses images before upload to avoid 413 errors
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.8
  maxSizeMB?: number; // Target max size in MB
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  maxSizeMB: 2, // Target 2MB to stay well under 4.5MB limit
};

/**
 * Compress an image file
 * Returns a compressed Blob
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(
            opts.maxWidth / width,
            opts.maxHeight / height
          );
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // If still too large, reduce quality and try again
            const sizeMB = blob.size / (1024 * 1024);
            if (sizeMB > opts.maxSizeMB && opts.quality > 0.5) {
              // Recursively compress with lower quality
              const newFile = new File([blob], file.name, { type: file.type });
              compressImage(newFile, { ...opts, quality: opts.quality - 0.1 })
                .then(resolve)
                .catch(reject);
            } else {
              resolve(blob);
            }
          },
          file.type || 'image/jpeg',
          opts.quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  const compressed = await Promise.all(
    files.map(async (file) => {
      const blob = await compressImage(file, options);
      return new File([blob], file.name, {
        type: file.type || 'image/jpeg',
        lastModified: Date.now(),
      });
    })
  );
  return compressed;
}
