"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Post } from "@/modules/posts/posts.types";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamic import for Markdown preview to avoid SSR issues
const MarkdownPreview = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
    { ssr: false }
);

interface ClientBlogWrapperProps {
    post: Post;
}

export default function ClientBlogWrapper({ post }: ClientBlogWrapperProps) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-primary-custom/30">
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 py-4">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/#blog" className="flex items-center gap-2 group text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-medium text-sm">Back to Portfolio</span>
                    </Link>
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                        {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-32 pb-16 relative overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-custom/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-custom/5 rounded-full blur-[120px]" />

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Metadata Tags */}
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-primary-custom font-mono text-xs uppercase tracking-widest">
                                Blog Post
                            </span>
                            {post.updated_at !== post.created_at && (
                                <span className="text-zinc-500 text-xs italic">
                                    Updated {new Date(post.updated_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
                            {post.title}
                        </h1>

                        {/* Featured Image */}
                        {post.image_url && (
                            <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800/50 shadow-2xl relative mb-12 group">
                                <img
                                    src={post.image_url}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-30" />
                            </div>
                        )}
                    </motion.div>
                </div>
            </header>

            {/* Content Section */}
            <main className="pb-32 relative">
                <div className="max-w-3xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
              prose-p:text-zinc-400 prose-p:leading-loose prose-p:font-light
              prose-a:text-primary-custom prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-bold
              prose-code:text-primary-custom prose-code:bg-zinc-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-2xl
              prose-img:rounded-2xl prose-img:shadow-xl
              prose-blockquote:border-l-primary-custom prose-blockquote:bg-zinc-900/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              [&>div]:!bg-transparent"
                    >
                        <MarkdownPreview
                            source={post.content}
                            style={{ backgroundColor: 'transparent', color: 'inherit' }}
                        />
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between relative z-10">
                    <div className="text-zinc-500 text-sm">
                        Thanks for reading.
                    </div>
                    <Link
                        href="/#blog"
                        className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:border-zinc-700 transition-all text-white font-bold text-sm"
                    >
                        Read More Articles
                    </Link>
                </div>
            </footer>
        </div>
    );
}
