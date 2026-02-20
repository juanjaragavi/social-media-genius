"use client";

/**
 * Dashboard — Landing page for authenticated users
 *
 * Shows recent posts, projects, quick actions, and search/filter controls.
 * Matches the Canva-style project management UX pattern.
 *
 * Sidebar views:
 *   - Dashboard  → overview (recent, projects, all posts)
 *   - Proyectos  → projects grid with create / search
 *   - Recientes  → recent posts grid
 *   - Plantillas → dimension / platform template picker
 */

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Zap,
  FolderPlus,
  Share2,
  Sparkles,
  LogOut,
  Search,
  LayoutDashboard,
  Folder,
  Clock,
  LayoutTemplate,
  ChevronRight,
  Loader2,
  Smartphone,
  Square,
  RectangleHorizontal,
  ArrowLeft,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { PostCard } from "@/components/dashboard/post-card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { SearchFilters } from "@/components/dashboard/search-filters";
import type { Post, Project } from "@/types/persistence";
import { BANNER_DIMENSIONS, type BannerDimension } from "@/types/editor";
import {
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  TiktokIcon,
  LinkedinIcon,
} from "@/components/ui/platform-icons";

// ─── View Titles ─────────────────────────────────────────────

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Proyectos",
  recent: "Recientes",
  templates: "Plantillas",
};

// ─── Template constants ──────────────────────────────────────

const DIMENSION_GROUPS = [
  {
    label: "Cuadrado",
    icon: Square,
    dims: BANNER_DIMENSIONS.filter((d) => d.aspectRatio === "1:1"),
  },
  {
    label: "Retrato",
    icon: Smartphone,
    dims: BANNER_DIMENSIONS.filter((d) =>
      ["4:5", "3:4", "9:16"].includes(d.aspectRatio),
    ),
  },
  {
    label: "Paisaje",
    icon: RectangleHorizontal,
    dims: BANNER_DIMENSIONS.filter((d) =>
      ["16:9", "1.91:1"].includes(d.aspectRatio),
    ),
  },
];

const PLATFORM_PRESETS = [
  {
    platform: "Instagram Feed",
    icon: <InstagramIcon className="h-4 w-4" />,
    dims: BANNER_DIMENSIONS.filter(
      (d) =>
        d.platform === "instagram" ||
        (d.aspectRatio === "1:1" && d.width === 1080),
    ),
  },
  {
    platform: "Instagram Stories / TikTok",
    icon: <TiktokIcon className="h-4 w-4" />,
    dims: BANNER_DIMENSIONS.filter((d) => d.aspectRatio === "9:16"),
  },
  {
    platform: "Twitter / X",
    icon: <TwitterIcon className="h-4 w-4" />,
    dims: BANNER_DIMENSIONS.filter((d) => d.platform === "twitter"),
  },
  {
    platform: "Facebook",
    icon: <FacebookIcon className="h-4 w-4" />,
    dims: BANNER_DIMENSIONS.filter((d) => d.platform === "facebook"),
  },
  {
    platform: "LinkedIn",
    icon: <LinkedinIcon className="h-4 w-4" />,
    dims: BANNER_DIMENSIONS.filter((d) => d.platform === "linkedin"),
  },
];

// ─── Sidebar Navigation ──────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Proyectos", icon: Folder },
  { id: "recent", label: "Recientes", icon: Clock },
  { id: "templates", label: "Plantillas", icon: LayoutTemplate },
] as const;

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [activeNav, setActiveNav] = useState("dashboard");

  // Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Redirect unauthenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Build query string from URL params
      const params = new URLSearchParams();
      const search = searchParams.get("search");
      const platform = searchParams.get("platform");
      const aspectRatio = searchParams.get("aspect_ratio");
      const sort = searchParams.get("sort");
      const projectId = searchParams.get("project_id");

      if (search) params.set("search", search);
      if (platform) params.set("platform", platform);
      if (aspectRatio) params.set("aspect_ratio", aspectRatio);
      if (sort) params.set("sort", sort);
      if (projectId) params.set("project_id", projectId);

      const [postsRes, recentRes, projectsRes] = await Promise.all([
        fetch(`/api/posts?${params.toString()}`),
        fetch("/api/posts?limit=8&sort=updated_at"),
        fetch("/api/projects"),
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts);
      }
      if (recentRes.ok) {
        const data = await recentRes.json();
        setRecentPosts(data.posts);
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user) fetchData();
  }, [session, fetchData]);

  // Actions
  const handleNewPost = async () => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Sin título" }),
      });
      if (res.ok) {
        const { post } = await res.json();
        router.push(`/editor/${post.id}`);
      }
    } catch (err) {
      console.error("❌ Error creating post:", err);
    }
  };

  const handleNewProject = async () => {
    const name = prompt("Nombre del proyecto:");
    if (!name?.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("❌ Error creating project:", err);
    }
  };

  const handleOpenPost = (id: string) => router.push(`/editor/${id}`);

  const handleNewPostWithDimension = async (dim: BannerDimension) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Sin título",
          platform: dim.platform || null,
          aspect_ratio: dim.aspectRatio,
          dimensions: { width: dim.width, height: dim.height },
        }),
      });
      if (res.ok) {
        const { post } = await res.json();
        router.push(`/editor/${post.id}`);
      }
    } catch (err) {
      console.error("❌ Error creating post from template:", err);
    }
  };

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
    if (projects.length === 0) {
      alert("No tienes proyectos. Crea uno primero.");
      return;
    }
    const projectName = prompt(
      `Proyectos disponibles:\n${projects.map((p) => `• ${p.name}`).join("\n")}\n\nEscribe el nombre del proyecto:`,
    );
    if (!projectName?.trim()) return;

    const project = projects.find(
      (p) => p.name.toLowerCase() === projectName.trim().toLowerCase(),
    );
    if (!project) {
      alert("Proyecto no encontrado.");
      return;
    }

    try {
      await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.id }),
      });
      fetchData();
    } catch (err) {
      console.error("❌ Error moving post:", err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (
      !confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")
    )
      return;
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("❌ Error deleting post:", err);
    }
  };

  const handleRenameProject = async (id: string, currentName: string) => {
    const newName = prompt("Nuevo nombre:", currentName);
    if (!newName?.trim() || newName.trim() === currentName) return;

    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      fetchData();
    } catch (err) {
      console.error("❌ Error renaming project:", err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (
      !confirm(
        "¿Eliminar este proyecto? Las publicaciones se desasociarán pero no se eliminarán.",
      )
    )
      return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("❌ Error deleting project:", err);
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

  // Show nothing while checking auth
  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user) return null;

  const hasAnyFilters =
    searchParams.has("search") ||
    searchParams.has("platform") ||
    searchParams.has("aspect_ratio") ||
    searchParams.has("project_id");

  return (
    <div className="h-screen flex bg-gray-50">
      {/* ─── Left Sidebar ─────────────────────────────────── */}
      <aside className="w-55 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-lime-600" />
            <span className="text-sm font-bold bg-linear-to-r from-blue-600 via-cyan-600 to-lime-600 bg-clip-text text-transparent">
              Social Media Genius
            </span>
            <Sparkles className="h-4 w-4 text-cyan-500" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                activeNav === item.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || ""}
                width={28}
                height={28}
                className="rounded-full border border-gray-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                {session.user.name}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {session.user.email}
              </p>
            </div>
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
      </aside>

      {/* ─── Main Content ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              {activeNav !== "dashboard" && (
                <button
                  onClick={() => setActiveNav("dashboard")}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Volver al Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-gray-800">
                {VIEW_TITLES[activeNav] ?? "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="https://storage.googleapis.com/media-topfinanzas-com/images/topnetworks-positivo-sinfondo.webp"
                alt="TopNetworks"
                width={120}
                height={32}
                className="h-6 w-auto opacity-60"
              />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-350 mx-auto">
          {/* ─── Dashboard View (default) ─────────────────── */}
          {activeNav === "dashboard" && (
            <>
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNewPost}
                  className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  Nuevo Post
                </button>
                <button
                  onClick={handleNewProject}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4" />
                  Nuevo Proyecto
                </button>
              </div>

              {/* Recent Posts — horizontal scroll row */}
              {!hasAnyFilters && recentPosts.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-800">
                      Recientes
                    </h2>
                    {recentPosts.length >= 8 && (
                      <button
                        onClick={() => setActiveNav("recent")}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        Ver todos
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="w-50 shrink-0">
                        <PostCard
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
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {!hasAnyFilters && projects.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-800">
                      Proyectos
                    </h2>
                    <button
                      onClick={() => setActiveNav("projects")}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                      Ver todos
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        name={project.name}
                        postCount={project.post_count ?? 0}
                        updatedAt={project.updated_at}
                        onClick={(id) => router.push(`/projects/${id}`)}
                        onRename={handleRenameProject}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All Posts with filters */}
              <section>
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-gray-800 mb-3">
                    {hasAnyFilters ? "Resultados" : "Todas las publicaciones"}
                  </h2>
                  <SearchFilters projects={projects} />
                </div>

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
                      {hasAnyFilters
                        ? "No se encontraron publicaciones con estos filtros"
                        : "Aún no tienes publicaciones"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {hasAnyFilters
                        ? "Prueba con otros filtros o limpia la búsqueda"
                        : "Crea tu primer post para empezar"}
                    </p>
                    {!hasAnyFilters && (
                      <button
                        onClick={handleNewPost}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Crear primer post
                      </button>
                    )}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ─── Proyectos View ───────────────────────────── */}
          {activeNav === "projects" && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNewProject}
                  className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4" />
                  Nuevo Proyecto
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      postCount={project.post_count ?? 0}
                      updatedAt={project.updated_at}
                      onClick={(id) => router.push(`/projects/${id}`)}
                      onRename={handleRenameProject}
                      onDelete={handleDeleteProject}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Folder className="h-7 w-7 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    Aún no tienes proyectos
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Organiza tus publicaciones creando un proyecto
                  </p>
                  <button
                    onClick={handleNewProject}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <FolderPlus className="h-4 w-4" />
                    Crear primer proyecto
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── Recientes View ───────────────────────────── */}
          {activeNav === "recent" && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNewPost}
                  className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  Nuevo Post
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {recentPosts.map((post) => (
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
                    <Clock className="h-7 w-7 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    Aún no tienes publicaciones recientes
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Crea tu primer post para empezar
                  </p>
                  <button
                    onClick={handleNewPost}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Crear primer post
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── Plantillas View ──────────────────────────── */}
          {activeNav === "templates" && (
            <>
              <p className="text-sm text-gray-500">
                Selecciona una plantilla para crear un nuevo post con las
                dimensiones óptimas para cada plataforma.
              </p>

              {/* By Platform */}
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-800">
                  Por plataforma
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PLATFORM_PRESETS.map((preset) => (
                    <div
                      key={preset.platform}
                      className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        {preset.icon}
                        <span className="text-sm font-semibold text-gray-800">
                          {preset.platform}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {preset.dims.map((dim) => (
                          <button
                            key={dim.label}
                            onClick={() => handleNewPostWithDimension(dim)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left cursor-pointer group"
                          >
                            {/* Aspect preview */}
                            <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 group-hover:border-blue-300 group-hover:bg-blue-100 transition-colors flex items-center justify-center">
                              <div
                                className="bg-gray-300 group-hover:bg-blue-400 rounded-sm transition-colors"
                                style={{
                                  width:
                                    dim.width > dim.height
                                      ? 20
                                      : Math.round(
                                          (20 * dim.width) / dim.height,
                                        ),
                                  height:
                                    dim.height > dim.width
                                      ? 20
                                      : Math.round(
                                          (20 * dim.height) / dim.width,
                                        ),
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                {dim.width}×{dim.height}
                              </div>
                              <div className="text-xs text-gray-400">
                                {dim.aspectRatio}
                              </div>
                            </div>
                            <Plus className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* By Dimension Group */}
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-800">
                  Todas las dimensiones
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DIMENSION_GROUPS.map((group) => {
                    const Icon = group.icon;
                    return (
                      <div
                        key={group.label}
                        className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            {group.label}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {group.dims.map((dim) => (
                            <button
                              key={dim.label}
                              onClick={() => handleNewPostWithDimension(dim)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left cursor-pointer group"
                            >
                              <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 group-hover:border-blue-300 group-hover:bg-blue-100 transition-colors flex items-center justify-center">
                                <div
                                  className="bg-gray-300 group-hover:bg-blue-400 rounded-sm transition-colors"
                                  style={{
                                    width:
                                      dim.width > dim.height
                                        ? 20
                                        : Math.round(
                                            (20 * dim.width) / dim.height,
                                          ),
                                    height:
                                      dim.height > dim.width
                                        ? 20
                                        : Math.round(
                                            (20 * dim.height) / dim.width,
                                          ),
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                  {dim.width}×{dim.height}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {dim.aspectRatio}
                                  {dim.platform && (
                                    <span className="ml-1 capitalize">
                                      · {dim.platform}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Plus className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
