import { createClient } from "@supabase/supabase-js";

const defaultUrl = "https://xmecjlnmeoqndpdtkzjj.supabase.co";
const defaultPublishableKey =
  "sb_publishable_PxjJTl5hxRC1zDiXFpSh3Q_ikNNSOOx";

const url = import.meta.env.VITE_SUPABASE_URL?.trim() || defaultUrl;
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  defaultPublishableKey;

export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase =
  url && publishableKey
    ? createClient(url, publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
