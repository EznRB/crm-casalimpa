'use client'

import { useEffect, useState } from 'react'
import { User, type AuthChangeEvent, type Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        setUser(null)
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: authListener } = supabase ? supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    }) : { data: { subscription: { unsubscribe() {} } } as any }

    return () => {
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  return { user, loading }
}
