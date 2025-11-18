"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedImage {
  url: string;
  altText: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate file size before uploading (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Step 1: Get presigned URL from backend
        const presignedResponse = await fetch("/api/admin/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
          }),
        });

        if (!presignedResponse.ok) {
          const errorData = (await presignedResponse.json()) as { error?: string };
          throw new Error(errorData.error || "Failed to get upload URL");
        }

        const { presignedUrl, publicUrl } = (await presignedResponse.json()) as {
          presignedUrl: string;
          publicUrl: string;
        };

        // Step 2: Upload directly to R2 using presigned URL
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name} to storage`);
        }

        // Step 3: Return the public URL
        return {
          url: publicUrl,
          altText: file.name.split(".")[0],
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedImages]);
      toast.success(`Successfully uploaded ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''}`);
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const updateAltText = (index: number, altText: string) => {
    const newImages = [...images];
    newImages[index].altText = altText;
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive
            ? "border-purple-500 bg-purple-900/10"
            : "border-gray-700 bg-gray-900"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={uploading || images.length >= maxImages}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-purple-400 animate-spin mb-4" />
            <p className="text-gray-400">Uploading images...</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              JPEG, PNG, WebP up to 5MB ({images.length}/{maxImages} images)
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={images.length >= maxImages}
            >
              Select Images
            </Button>
          </>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700"
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.altText || `Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="p-2">
                <input
                  type="text"
                  value={image.altText}
                  onChange={(e) => updateAltText(index, e.target.value)}
                  placeholder="Alt text"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
