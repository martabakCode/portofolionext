"use client";

import { useTransition } from "react";
import { deleteExperienceAction } from "@/app/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id, company }: { id: string, company: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete experience at ${company}?`)) return;

        startTransition(async () => {
            const res = await deleteExperienceAction(id);
            if (res.success) {
                toast.success("Experience deleted");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
        >
            {isPending ? "..." : "Delete"}
        </button>
    );
}
