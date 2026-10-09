import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["recovery", "invite", "magiclink", "email", "signup", "email_change"];

/**
 * Retorno dos e-mails do Supabase Auth (convite e redefinição de senha).
 * Aceita o fluxo PKCE (?code=) e o de token (?token_hash=&type=).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const nextParam = searchParams.get("next") ?? "/admin";
  const next = nextParam.startsWith("/admin") && !nextParam.startsWith("//") ? nextParam : "/admin";
  const supabase = await createServerSupabase();

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type && OTP_TYPES.includes(type)) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  // Convites levam à criação de senha
  const destination = type === "invite" ? "/admin/nova-senha" : next;
  return NextResponse.redirect(new URL(ok ? destination : "/admin/login?erro=link", origin));
}
