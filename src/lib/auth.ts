import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";

export type LoginResult =
  | { ok: true }
  | { ok: false; message: string };

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

function isNetworkError(message: string) {
  return /failed to fetch|network|load failed|name_not_resolved|err_name/i.test(
    message,
  );
}

const networkMessage =
  "No se pudo conectar con Supabase. Verifica que el proyecto esté activo y que la URL sea correcta.";

export async function signIn(email: string, password: string): Promise<LoginResult> {
  if (!supabase) {
    if (email === "demo@gmail.com" && password === "123456789") {
      return { ok: true };
    }
    return {
      ok: false,
      message: "Credenciales incorrectas. Verifica tu correo y contraseña.",
    };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (isNetworkError(error.message)) {
        return { ok: false, message: networkMessage };
      }
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return {
          ok: false,
          message: "La cuenta existe pero el correo no está confirmado. Revisa tu bandeja.",
        };
      }
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        return {
          ok: false,
          message: "Correo o contraseña incorrectos. Usa la cuenta creada en Supabase.",
        };
      }
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      message: isNetworkError(message) ? networkMessage : message,
    };
  }
}

export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}
