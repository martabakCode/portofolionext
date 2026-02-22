"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadFileClient, deleteFileClient, extractFilenameFromUrl, UploadBucket } from "@/lib/storage";

interface ImageUploadProps {
    bucket: UploadBucket;
    value: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
    previewClassName?: string;
    accept?: string;
}

export function ImageUpload({
    bucket,
    value,
    onChange,
    label = "Image",
    placeholder = "Upload an image...",
    previewClassName = "w-full h-48",
    accept = "image/*",
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit");
            return;
        }

        setUploading(true);

        try {
            // Delete old file if exists
            if (value) {
                const oldFilename = extractFilenameFromUrl(value, bucket);
                if (oldFilename) {
                    await deleteFileClient(bucket, oldFilename);
                }
            }

            const result = await uploadFileClient(file, bucket);

            if (result.success && result.url) {
                onChange(result.url);
                toast.success("Image uploaded successfully");
            } else {
                toast.error(result.error || "Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleRemove = async () => {
        if (!value) return;

        const filename = extractFilenameFromUrl(value, bucket);
        if (filename) {
            const result = await deleteFileClient(bucket, filename);
            if (!result.success) {
                console.warn("Failed to delete old file:", result.error);
            }
        }

        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-zinc-400 text-sm">{label}</label>

            {value ? (
                <div className="relative">
                    <div className={`relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 ${previewClassName}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                        title="Remove image"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-200
                        ${dragOver 
                            ? "border-primary-custom bg-primary-custom/5" 
                            : "border-zinc-700 hover:border-zinc-600 bg-zinc-900/50"
                        }
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="hidden"
                    />
                    
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-primary-custom border-t-transparent rounded-full animate-spin" />
                            <span className="text-zinc-400 text-sm">Uploading...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-zinc-300 text-sm font-medium">{placeholder}</p>
                                <p className="text-zinc-500 text-xs mt-1">Drag & drop or click to browse</p>
                                <p className="text-zinc-600 text-xs mt-1">JPEG, PNG, GIF, WebP up to 5MB</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
