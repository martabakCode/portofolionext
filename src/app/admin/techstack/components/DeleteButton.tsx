"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteTechStackAction } from "@/app/admin/actions";
import Modal from "@/components/ui/Modal";

interface DeleteButtonProps {
    id: string;
    techName?: string;
}

export function DeleteButton({ id, techName }: DeleteButtonProps) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteTechStackAction(id);
            if (result.success) {
                toast.success("Tech stack deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete tech stack");
            }
        } catch (error) {
            toast.error("Failed to delete tech stack: " + (error as Error).message);
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
            >
                Delete
            </button>

            <Modal
                isOpen={isModalOpen}
                title="Delete Tech Stack"
                message={techName 
                    ? `Are you sure you want to delete "${techName}"? This action cannot be undone.`
                    : "Are you sure you want to delete this tech stack? This action cannot be undone."
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setIsModalOpen(false)}
                isLoading={loading}
            />
        </>
    );
}
