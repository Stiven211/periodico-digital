import { useCallback, useEffect, useMemo, useState } from "react";
import type { DriveFile, DriveIndex } from "../types/drive";
import { supabase } from "./supabase";

export const publicationsBase = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export function publicationMedia(slug: string, src: string) {
  return `${publicationsBase}publications/${slug}/${src}`;
}

type PublishedMap = Record<string, string>;

const supabaseConfigMessage =
  "Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.";

function requireSupabase() {
  if (!supabase) {
    throw new Error(supabaseConfigMessage);
  }
  return supabase;
}

function errorText(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function publishingErrorMessage(error: unknown) {
  const message = errorText(error);
  if (/failed to fetch|network|load failed|name_not_resolved|err_name/i.test(message)) {
    return "No se pudo conectar con Supabase. Verifica que el proyecto esté activo y que la URL sea correcta.";
  }
  if (/row-level security/i.test(message)) {
    return "Tu cuenta no tiene permisos de docente. Agrega su correo a la tabla teacher_emails en Supabase.";
  }
  if (/could not find the table|PGRST205/i.test(message)) {
    return "Falta crear la tabla published_articles. Ejecuta supabase/migrations/0001_published_articles.sql en el SQL Editor.";
  }
  if (/jwt|not authenticated|session/i.test(message)) {
    return "La sesión expiró. Vuelve a iniciar sesión para publicar.";
  }
  return message;
}

async function fetchSupabasePublished(): Promise<PublishedMap> {
  const client = requireSupabase();

  const { data, error } = await client
    .from("published_articles")
    .select("slug, published_at")
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [String(row.slug), String(row.published_at)]),
  );
}

export async function publishArticle(slug: string) {
  const client = requireSupabase();

  const { error } = await client
    .from("published_articles")
    .upsert(
      { slug, published_at: new Date().toISOString() },
      { onConflict: "slug" },
    );

  if (error) {
    throw new Error(publishingErrorMessage(error));
  }
}

export async function unpublishArticle(slug: string) {
  const client = requireSupabase();

  const { error } = await client
    .from("published_articles")
    .delete()
    .eq("slug", slug);

  if (error) {
    throw new Error(publishingErrorMessage(error));
  }
}

export function usePublishedArticles() {
  const [published, setPublished] = useState<PublishedMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setPublished(await fetchSupabasePublished());
      setError(null);
    } catch (err) {
      setError(publishingErrorMessage(err));
      setPublished({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const refresh = () => {
      void reload();
    };
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
    };
  }, [reload]);

  return { published, loading, error, reload };
}

export function usePublishedArticle(slug: string) {
  const { published, loading, error } = usePublishedArticles();
  return { publishedAt: published[slug] ?? null, loading, error };
}

export function applyPublished(
  files: DriveFile[],
  published: PublishedMap,
): DriveFile[] {
  return files.map((file) => {
    const publishedAt = published[file.slug];
    if (!publishedAt) {
      return file;
    }
    return { ...file, status: "published", publishedAt };
  });
}

export async function fetchDriveIndex(): Promise<DriveIndex> {
  const response = await fetch(
    `${publicationsBase}publications/index.json?t=${Date.now()}`,
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as DriveIndex;
}

export function parsePublicationDate(value: string) {
  return new Date(value.includes("T") ? value : `${value}T12:00:00`);
}

export function formatPublicationDate(value: string) {
  return parsePublicationDate(value).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function useDriveIndex() {
  const [index, setIndex] = useState<DriveIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    published: publishedMap,
    loading: publishedLoading,
    error: publishingError,
    reload: reloadPublished,
  } = usePublishedArticles();

  const loadIndex = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setIndex(await fetchDriveIndex());
    } catch {
      setError(
        'No se encontró el índice de Drive. Ejecuta "python tools/sync_drive.py" para generar las publicaciones.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIndex();
  }, [loadIndex]);

  const reload = useCallback(async () => {
    await Promise.all([loadIndex(), reloadPublished()]);
  }, [loadIndex, reloadPublished]);

  const files = useMemo(
    () => applyPublished(index?.files ?? [], publishedMap),
    [index, publishedMap],
  );

  const published = useMemo(
    () =>
      files
        .filter((file) => publishedMap[file.slug])
        .sort((a, b) =>
          (publishedMap[b.slug] ?? "").localeCompare(
            publishedMap[a.slug] ?? "",
          ),
        ),
    [files, publishedMap],
  );

  const publish = useCallback(
    async (slug: string) => {
      await publishArticle(slug);
      await reloadPublished();
    },
    [reloadPublished],
  );

  const unpublish = useCallback(
    async (slug: string) => {
      await unpublishArticle(slug);
      await reloadPublished();
    },
    [reloadPublished],
  );

  return {
    index,
    files,
    published,
    loading,
    publishedLoading,
    error,
    publishingError,
    reload,
    publish,
    unpublish,
  };
}
