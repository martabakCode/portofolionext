"use server";

import { createClient } from "@/lib/supabaseServer";

export type UploadBucket = "projects" | "avatars" | "logos" | "posts";

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload file to Supabase Storage (Server-side)
 */
export async function uploadFileServer(
    file: File | Buffer,
    bucket: UploadBucket,
    fileName: string,
    contentType?: string
): Promise<UploadResult> {
    try {
        const supabase = await createClient();

        // Check if bucket exists, if not create it
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucket);

        if (!bucketExists) {
            await supabase.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 5242880, // 5MB limit
            });
        }

        // Upload file
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                contentType,
                upsert: true,
            });

        if (uploadError) {
            console.error("[Storage] Upload error:", uploadError);
            return { success: false, error: uploadError.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("[Storage] Unexpected error:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
}

/**
 * Delete file from Supabase Storage (Server-side)
 */
export async function deleteFileServer(
    bucket: UploadBucket,
    fileName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName]);

        if (error) {
            console.error("[Storage] Delete error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[Storage] Delete unexpected error:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
}

/**
 * Extract filename from Supabase Storage URL
 */
export function extractFilenameFromUrl(url: string, bucket: UploadBucket): string | null {
    try {
        const urlObj = new URL(url);
        // Supabase storage URL pattern: .../storage/v1/object/public/{bucket}/{filename}
        const pathMatch = urlObj.pathname.match(new RegExp(`/object/public/${bucket}/(.+)`));
        return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    } catch {
        return null;
    }
}
