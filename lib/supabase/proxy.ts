import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

/**
 * Renova a sessão do Supabase nas rotas do painel e faz a checagem otimista
 * de autenticação. A autorização real (papel) é verificada no servidor em
 * cada página e Server Action — nunca dependa apenas deste proxy.
 */
export async function updateAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isLoginRoute = request.nextUrl.pathname.startsWith("/admin/login");
  const isAuthCallback = request.nextUrl.pathname.startsWith("/admin/auth");

  if (!data?.claims && !isLoginRoute && !isAuthCallback) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    if (request.nextUrl.pathname !== "/admin") url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return response;
}
