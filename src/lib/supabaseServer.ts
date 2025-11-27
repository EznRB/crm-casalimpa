import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

export function getServerSupabase(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )
  return supabase
}

export async function getAuthUser(request: NextRequest) {
  const supabase = getServerSupabase(request)
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}
