"use client";

/**
 * Editor Page — /editor/[postId]
 *
 * Loads a post from the API, hydrates the canvas, and enables autosave.
 * For new posts, opens with an empty canvas ready for generation.
 */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { EditorLayout } from "@/components/editor/editor-layout";
import { Loader2 } from "lucide-react";
import type { Post } from "@/types/persistence";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  const { data: session, isPending } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  // Fetch post data on mount
  useEffect(() => {
    if (!session?.user || !postId) return;

    async function loadPost() {
      try {
        setLoading(true);
        const res = await fetch(`/api/posts/${postId}`);
        if (res.status === 404) {
          setError("Publicación no encontrada.");
          return;
        }
        if (!res.ok) {
          setError("Error al cargar la publicación.");
          return;
        }
        const data = await res.json();
        setPost(data.post);
      } catch (err) {
        console.error("❌ Error loading post:", err);
        setError("Error de conexión.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId, session]);

  if (isPending || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <p className="text-sm text-gray-400">Cargando editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (!session?.user) return null;

  return <EditorLayout postId={postId} initialPost={post} />;
}
