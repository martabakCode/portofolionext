"use client";

import { toast } from "sonner";

import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardData, deletePostAction, deleteProjectAction, deleteExperienceAction } from "./actions";
import { Post } from "@/modules/posts/posts.types";
import { Project } from "@/modules/projects/projects.types";
import { Profile } from "@/modules/profile/profile.types";
import { Experience } from "@/modules/experience/experience.types";
import Modal from "@/components/ui/Modal";

interface DashboardData {
    posts: Post[];
    projects: Project[];
    profile: Profile | null;
    experiences: Experience[];
    stats: {
        postsCount: number;
        projectsCount: number;
        experiencesCount: number;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData>({
        posts: [],
        projects: [],
        profile: null,
        experiences: [],
        stats: { postsCount: 0, projectsCount: 0, experiencesCount: 0 },
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getDashboardData();
            setData(res);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push(ROUTES.LOGIN);
        router.refresh(); // Clear server component cache
    };

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });
    const [actionLoading, setActionLoading] = useState(false);

    const openDeleteModal = (title: string, message: string, onConfirm: () => Promise<void>) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            onConfirm: async () => {
                setActionLoading(true);
                await onConfirm();
                setActionLoading(false);
                setModalConfig((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleDeletePost = (id: string, title: string) => {
        openDeleteModal(
            "Delete Post",
            `Are you sure you want to delete post "${title}"?`,
            async () => {
                const toastId = toast.loading("Deleting post...");
                const res = await deletePostAction(id);

                if (res.success) {
                    toast.success("Post deleted successfully", { id: toastId });
                    setData((prev) => ({
                        ...prev,
                        posts: prev.posts.filter((p) => p.id !== id),
                        stats: { ...prev.stats, postsCount: prev.stats.postsCount - 1 },
                    }));
                } else {
                    toast.error("Failed to delete post: " + res.error, { id: toastId });
                }
            }
        );
    };

    const handleDeleteProject = (id: string, title: string) => {
        openDeleteModal(
            "Delete Project",
            `Are you sure you want to delete project "${title}"?`,
            async () => {
                const toastId = toast.loading("Deleting project...");
                const res = await deleteProjectAction(id);

                if (res.success) {
                    toast.success("Project deleted successfully", { id: toastId });
                    setData((prev) => ({
                        ...prev,
                        projects: prev.projects.filter((p) => p.id !== id),
                        stats: { ...prev.stats, projectsCount: prev.stats.projectsCount - 1 },
                    }));
                } else {
                    toast.error("Failed to delete project: " + res.error, { id: toastId });
                }
            }
        );
    };

    const handleDeleteExperience = (id: string, company: string) => {
        openDeleteModal(
            "Delete Experience",
            `Are you sure you want to delete experience at "${company}"?`,
            async () => {
                const toastId = toast.loading("Deleting experience...");
                const res = await deleteExperienceAction(id);

                if (res.success) {
                    toast.success("Experience deleted successfully", { id: toastId });
                    setData((prev) => ({
                        ...prev,
                        experiences: prev.experiences.filter((e) => e.id !== id),
                        stats: { ...prev.stats, experiencesCount: prev.stats.experiencesCount - 1 },
                    }));
                } else {
                    toast.error("Failed to delete experience: " + res.error, { id: toastId });
                }
            }
        );
    };

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-custom to-secondary-custom" />
                        <h1 className="text-white font-bold text-lg tracking-tight">
                            Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/admin/settings"
                            className="text-zinc-400 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="text-zinc-400 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-10 pb-24">
                {/* Welcome Card & Profile Summary */}
                <div className="bg-gradient-to-br from-primary-custom/10 to-secondary-custom/10 border border-primary-custom/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-primary-custom/30 shrink-0">
                            {data.profile?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={data.profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {data.profile?.full_name ? `Welcome back, ${data.profile.full_name.split(' ')[0]} 👋` : "Welcome back, Admin 👋"}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <p className="text-zinc-400 text-sm">
                                    {data.profile?.headline || "Manage your portfolio content, blog posts, and projects from here."}
                                </p>
                                {data.profile?.email && (
                                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Site CTA Connected: {data.profile.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link href="/admin/settings" className="flex-1 md:flex-none text-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700">
                            Edit Profile
                        </Link>
                        <a href="/" target="_blank" className="flex-1 md:flex-none text-center px-4 py-2 bg-primary-custom hover:bg-primary-custom/80 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-custom/20">
                            View Live Site
                        </a>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-zinc-400 text-sm font-medium">
                                Blog Posts
                            </span>
                            <span className="text-xl">📝</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {loading ? "..." : data.stats.postsCount}
                        </p>
                    </div>

                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-zinc-400 text-sm font-medium">Projects</span>
                            <span className="text-xl">🚀</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {loading ? "..." : data.stats.projectsCount}
                        </p>
                    </div>

                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-zinc-400 text-sm font-medium">Experiences</span>
                            <span className="text-xl">💼</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {loading ? "..." : data.stats.experiencesCount}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <Link
                        href="/admin/posts/new"
                        className="flex flex-col justify-center items-start bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary-custom/10 text-primary-custom group-hover:bg-primary-custom/20 transition-colors">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>
                            <span className="text-white font-medium group-hover:text-primary-custom transition-colors">
                                New Blog Post
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm ml-11">
                            Write and publish a new article
                        </p>
                    </Link>

                    <Link
                        href="/admin/projects/new"
                        className="flex flex-col justify-center items-start bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-secondary-custom/10 text-secondary-custom group-hover:bg-secondary-custom/20 transition-colors">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>
                            <span className="text-white font-medium group-hover:text-secondary-custom transition-colors">
                                New Project
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm ml-11">
                            Add a project to your showcase
                        </p>
                    </Link>

                    <Link
                        href="/admin/experience/new"
                        className="flex flex-col justify-center items-start bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                                New Experience
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm ml-11">
                            Add a new work experience
                        </p>
                    </Link>

                    <Link
                        href="/admin/settings"
                        className="flex flex-col justify-center items-start bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                Settings
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm ml-11">
                            Configure your profile
                        </p>
                    </Link>

                    <Link
                        href="/admin/configuration"
                        className="flex flex-col justify-center items-start bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-white font-medium group-hover:text-red-400 transition-colors">
                                Configuration
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm ml-11">
                            Site appearance & logo
                        </p>
                    </Link>

                    <Link
                        href="/admin/techstack"
                        className="flex flex-col justify-center items-start bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                                Tech Stack
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm ml-11">
                            Manage skills & technologies
                        </p>
                    </Link>
                </div>

                {/* Content Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Posts */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden h-fit">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <h3 className="text-lg font-semibold text-white">Recent Posts</h3>
                            <Link
                                href="/admin/posts/new"
                                className="text-xs font-medium text-primary-custom hover:text-primary-custom/80 transition-colors"
                            >
                                + Add New
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <div className="p-8 text-center text-zinc-500">Loading...</div>
                            ) : data.posts.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    No posts found.
                                </div>
                            ) : (
                                data.posts.slice(0, 5).map((post) => (
                                    <div
                                        key={post.id}
                                        className="p-4 hover:bg-zinc-800/30 transition-colors group flex justify-between items-center"
                                    >
                                        <div className="min-w-0">
                                            <h4 className="text-white font-medium mb-1 truncate">
                                                {post.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full ${post.published
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : "bg-amber-500/10 text-amber-400"
                                                        }`}
                                                >
                                                    {post.published ? "Published" : "Draft"}
                                                </span>
                                                <span className="text-zinc-500">
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                                            <Link
                                                href={`/admin/posts/${post.id}/edit`}
                                                title="Edit"
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </Link>
                                            <button
                                                title="Delete"
                                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                onClick={() => handleDeletePost(post.id, post.title)}
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Projects */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden h-fit">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <h3 className="text-lg font-semibold text-white">Projects</h3>
                            <Link
                                href="/admin/projects/new"
                                className="text-xs font-medium text-secondary-custom hover:text-secondary-custom/80 transition-colors"
                            >
                                + Add New
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <div className="p-8 text-center text-zinc-500">Loading...</div>
                            ) : data.projects.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    No projects found.
                                </div>
                            ) : (
                                data.projects.slice(0, 5).map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-4 hover:bg-zinc-800/30 transition-colors group flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            {project.image_url && (
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={project.image_url}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="text-white font-medium mb-1 truncate">
                                                    {project.title}
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {project.tech_stack?.slice(0, 2).map((tech) => (
                                                        <span
                                                            key={tech}
                                                            className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.tech_stack?.length > 2 && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-500">
                                                            +{project.tech_stack.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                                            <Link
                                                href={`/admin/projects/${project.id}/edit`}
                                                title="Edit"
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </Link>
                                            <button
                                                title="Delete"
                                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                onClick={() =>
                                                    handleDeleteProject(project.id, project.title)
                                                }
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Experiences */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden h-fit">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <h3 className="text-lg font-semibold text-white">Experience</h3>
                            <Link
                                href="/admin/experience/new"
                                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                + Add New
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <div className="p-8 text-center text-zinc-500">Loading...</div>
                            ) : data.experiences.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    No experiences found.
                                </div>
                            ) : (
                                data.experiences.map((exp) => (
                                    <div
                                        key={exp.id}
                                        className="p-4 hover:bg-zinc-800/30 transition-colors group flex justify-between items-center"
                                    >
                                        <div className="min-w-0">
                                            <h4 className="text-white font-medium mb-1 truncate">
                                                {exp.role}
                                            </h4>
                                            <div className="text-xs text-zinc-400 mb-1 truncate">
                                                {exp.company}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                                <span>
                                                    {new Date(exp.start_date).getFullYear()} - {exp.current ? "Present" : new Date(exp.end_date!).getFullYear()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                                            <Link
                                                href={`/admin/experience/${exp.id}/edit`}
                                                title="Edit"
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </Link>
                                            <button
                                                title="Delete"
                                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                onClick={() => handleDeleteExperience(exp.id, exp.company)}
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Modal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                isLoading={actionLoading}
                confirmText="Delete"
            />
        </div >
    );
}
