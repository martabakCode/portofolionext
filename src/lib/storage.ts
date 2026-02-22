import { createClient as createBrowserClient } from "@/lib/supabaseClient";

export type UploadBucket = "projects" | "avatars" | "logos" | "posts";

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload file to Supabase Storage (Client-side)
 */
export async function uploadFileClient(
    file: File,
    bucket: UploadBucket,
    fileName?: string
): Promise<UploadResult> {
    try {
        const supabase = createBrowserClient();

        // Generate unique filename if not provided
        const finalFileName = fileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucket);

        if (!bucketExists) {
            // Create bucket if it doesn't exist
            await supabase.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 5242880, // 5MB limit
            });
        }

        // Upload file
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(finalFileName, file, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            console.error("[Storage] Upload error:", uploadError);
            return { success: false, error: uploadError.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(finalFileName);

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
 * Delete file from Supabase Storage
 */
export async function deleteFileClient(
    bucket: UploadBucket,
    fileName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createBrowserClient();

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
