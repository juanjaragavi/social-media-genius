"use client";

/**
 * Project Detail Page — /projects/[id]
 *
 * Full-page post grid filtered to a specific project.
 * Includes breadcrumb navigation back to dashboard.
 */

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronRight,
  Plus,
  Share2,
  Sparkles,
  LogOut,
  Search,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { PostCard } from "@/components/dashboard/post-card";
import { SearchFilters } from "@/components/dashboard/search-filters";
import type { Post, Project } from "@/types/persistence";

function ProjectDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const projectId = params.id as string;
  const { data: session, isPending } = useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Redirect unauthenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);

      const qp = new URLSearchParams();
      qp.set("project_id", projectId);
      const search = searchParams.get("search");
      const platform = searchParams.get("platform");
      const aspectRatio = searchParams.get("aspect_ratio");
      const sort = searchParams.get("sort");
      if (search) qp.set("search", search);
      if (platform) qp.set("platform", platform);
      if (aspectRatio) qp.set("aspect_ratio", aspectRatio);
      if (sort) qp.set("sort", sort);

      const [postsRes, projectsRes] = await Promise.all([
        fetch(`/api/posts?${qp.toString()}`),
        fetch("/api/projects"),
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts);
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setAllProjects(data.projects);
        const found = data.projects.find((p: Project) => p.id === projectId);
        setProject(found ?? null);
      }
    } catch (err) {
      console.error("❌ Project detail fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, searchParams]);

  useEffect(() => {
    if (session?.user) fetchData();
  }, [session, fetchData]);

  const handleNewPost = async () => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Sin título",
          project_id: projectId,
        }),
      });
      if (res.ok) {
        const { post } = await res.json();
        router.push(`/editor/${post.id}`);
      }
    } catch (err) {
      console.error("❌ Error creating post:", err);
    }
  };

  const handleOpenPost = (id: string) => router.push(`/editor/${id}`);

  const handleRenamePost = async (id: string, currentTitle: string) => {
    const newTitle = prompt("Nuevo nombre:", currentTitle);
    if (!newTitle?.trim() || newTitle.trim() === currentTitle) return;
    try {
      await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      fetchData();
    } catch (err) {
      console.error("❌ Error renaming post:", err);
    }
  };

  const handleMoveToProject = async (postId: string) => {
    if (allProjects.length === 0) return;
    const projectName = prompt(
      `Proyectos disponibles:\n${allProjects.map((p) => `• ${p.name}`).join("\n")}\n\nEscribe el nombre del proyecto (vacío para desasociar):`,
    );
    if (projectName === null) return;

    let targetProjectId: string | null = null;
    if (projectName.trim()) {
      const found = allProjects.find(
        (p) => p.name.toLowerCase() === projectName.trim().toLowerCase(),
      );
      if (!found) {
        alert("Proyecto no encontrado.");
        return;
      }
      targetProjectId = found.id;
    }

    try {
      await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: targetProjectId }),
      });
      fetchData();
    } catch (err) {
      console.error("❌ Error moving post:", err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("❌ Error deleting post:", err);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      window.location.href = "/login";
    } catch {
      setSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Dashboard
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium text-gray-800">
                {project?.name || "Proyecto"}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-lime-600" />
              <span className="text-xs font-bold bg-linear-to-r from-blue-600 via-cyan-600 to-lime-600 bg-clip-text text-transparent">
                Social Media Genius
              </span>
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
            </div>
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || ""}
                width={28}
                height={28}
                className="rounded-full border border-gray-200"
              />
            )}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-350 mx-auto space-y-6">
          {/* Project header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {project?.name || "Proyecto"}
              </h1>
              {project?.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {project.description}
                </p>
              )}
            </div>
            <button
              onClick={handleNewPost}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Nuevo Post
            </button>
          </div>

          {/* Filters */}
          <SearchFilters projects={allProjects} showProjectFilter={false} />

          {/* Posts grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  platform={post.platform}
                  aspectRatio={post.aspect_ratio}
                  thumbnailUrl={post.thumbnail_url}
                  updatedAt={post.updated_at}
                  onOpen={handleOpenPost}
                  onRename={handleRenamePost}
                  onMoveToProject={handleMoveToProject}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Este proyecto no tiene publicaciones
              </p>
              <button
                onClick={handleNewPost}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Crear post
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
}
