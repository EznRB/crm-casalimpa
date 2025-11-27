import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function genId() {
  return Math.random().toString(36).slice(2)
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const isDev = process.env.NODE_ENV !== 'production'
  const devAuth = isDev && request.cookies.get('dev_auth')?.value === '1'
  if (devAuth) {
    const rid = request.headers.get('x-request-id') || genId()
    supabaseResponse.headers.set('x-request-id', rid)
    return supabaseResponse
  }

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between here and supabase.auth.getUser().
  // A mistake of that nature will usually cause H14 errors.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (devAuth) {
    const rid = request.headers.get('x-request-id') || genId()
    supabaseResponse.headers.set('x-request-id', rid)
    return supabaseResponse
  }

  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  const rid = request.headers.get('x-request-id') || genId()
  supabaseResponse.headers.set('x-request-id', rid)
  supabaseResponse.headers.set('x-frame-options', 'DENY')
  supabaseResponse.headers.set('x-content-type-options', 'nosniff')
  supabaseResponse.headers.set('referrer-policy', 'no-referrer')
  supabaseResponse.headers.set(
    'content-security-policy',
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://*.supabase.co https://api-inference.huggingface.co; font-src 'self'; frame-ancestors 'none'"
  )
  supabaseResponse.headers.set(
    'permissions-policy',
    'camera=(), microphone=(), geolocation=()'
  )
  return supabaseResponse
}
export async function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname
  if (
    p.startsWith('/api') ||
    p.startsWith('/_next') ||
    p.startsWith('/favicon') ||
    p.startsWith('/manifest') ||
    p.startsWith('/icons') ||
    p.endsWith('.png') ||
    p.endsWith('.jpg') ||
    p.endsWith('.jpeg') ||
    p.endsWith('.svg') ||
    p.endsWith('.ico') ||
    p.endsWith('.json')
  ) {
    const res = NextResponse.next({ request })
    const rid = request.headers.get('x-request-id') || genId()
    res.headers.set('x-request-id', rid)
    res.headers.set('x-frame-options', 'DENY')
    res.headers.set('x-content-type-options', 'nosniff')
    res.headers.set('referrer-policy', 'no-referrer')
    res.headers.set(
      'content-security-policy',
      "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://*.supabase.co https://api-inference.huggingface.co; font-src 'self'; frame-ancestors 'none'"
    )
    res.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()')
    return res
  }
  return updateSession(request)
}
