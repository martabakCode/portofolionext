"use server";

import { uploadFileServer, UploadBucket } from "@/lib/storageServer";
import { revalidatePath } from "next/cache";

interface UploadImageResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Server action to upload image to Supabase Storage
 */
export async function uploadImageAction(
    formData: FormData
): Promise<UploadImageResult> {
    try {
        const file = formData.get("file") as File;
        const bucket = formData.get("bucket") as string;

        if (!file || !bucket) {
            return { success: false, error: "File and bucket are required" };
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return { 
                success: false, 
                error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." 
            };
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: "File size exceeds 5MB limit" };
        }

        // Generate unique filename
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

        // Convert File to Buffer for server upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await uploadFileServer(
            buffer,
            bucket as UploadBucket,
            fileName,
            file.type
        );

        if (result.success) {
            revalidatePath("/admin");
        }

        return result;
    } catch (error) {
        console.error("[UploadAction] Error:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Upload failed" 
        };
    }
}
