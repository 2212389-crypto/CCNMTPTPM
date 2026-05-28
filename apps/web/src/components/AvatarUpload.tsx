import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { getApiUrl, getAuthHeaders, getAvatarUrl } from '../utils/api';

// Function to resize image
const resizeImage = (file: File, maxWidth: number = 150, maxHeight: number = 150, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, file.type, quality);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (newAvatarUrl: string | null) => void;
  isLoading?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  isLoading = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Chỉ cho phép file ảnh!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn! Kích thước tối đa là 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Try to resize image, fallback to original if failed
      let fileToUpload = file;
      try {
        fileToUpload = await resizeImage(file, 150, 150, 0.8);
        console.log('Image resized successfully');
      } catch (resizeError) {
        console.warn('Failed to resize image, using original:', resizeError);
        fileToUpload = file;
      }
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(fileToUpload);

      // Upload file
      const formData = new FormData();
      formData.append('avatar', fileToUpload);

      const response = await fetch(getApiUrl('/api/users/avatar'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('Avatar upload response:', result);
      onAvatarChange(result.avatarUrl);
      setPreviewUrl(null);
      
      // Show success message
      alert('Upload ảnh thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi khi upload ảnh');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };



  const displayUrl = previewUrl || getAvatarUrl(currentAvatarUrl || null);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display - Clickable */}
      <div 
        className="relative cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Camera size={24} />
            </div>
          )}
        </div>
        
        {/* Loading overlay */}
        {(uploading || isLoading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}

        {/* Hover overlay for existing avatar */}
        {displayUrl && !uploading && !isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200">
            <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}
      </div>

      {/* Upload instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {displayUrl ? 'Click ảnh để thay đổi' : 'Click để tải ảnh lên'}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help text */}
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Chọn ảnh JPG, PNG hoặc GIF. Kích thước tối đa 5MB.
      </p>
    </div>
  );
};