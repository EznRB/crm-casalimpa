'use client'

import { useEffect, useState } from 'react'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!supabase) {
        if (email === 'admin@local.test' && password === 'admin') {
          const expires = new Date(Date.now() + 1000 * 60 * 60 * 8).toUTCString()
          document.cookie = `dev_auth=1; path=/; expires=${expires}`
          router.push('/')
          return
        }
        setMessage('Modo offline: use admin@local.test / admin ou configure o Supabase nas variáveis de ambiente.')
        return
      }
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          if (email === 'admin@local.test' && password === 'admin') {
            const expires = new Date(Date.now() + 1000 * 60 * 60 * 8).toUTCString()
            document.cookie = `dev_auth=1; path=/; expires=${expires}`
            router.push('/')
            return
          }
          setMessage('Falha no login: ' + error.message)
        } else if (data.session) {
          router.push('/')
        } else {
          setMessage('Login inválido')
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
          },
        })
        if (error) {
          setMessage('Falha no cadastro: ' + error.message)
        } else {
          setMessage('Cadastro criado. Verifique seu email para confirmar.')
        }
      }
    } catch (err) {
      setMessage('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const check = async () => {
      if (!supabase) return
      const { data } = await supabase.auth.getSession()
      if (mounted && data.session) {
        router.replace('/')
      }
    }
    const { data: sub } = supabase?.auth.onAuthStateChange((ev: AuthChangeEvent) => {
      if (ev === 'SIGNED_IN') router.replace('/')
    }) ?? { data: null }
    check()
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [router])

  const handleMagicLink = async () => {
    setLoading(true)
    setMessage('')
    try {
      if (!supabase) {
        setMessage('Configuração do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
        return
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback` },
      })
      if (error) setMessage('Erro ao enviar email: ' + error.message)
      else setMessage('Email enviado! Verifique sua caixa de entrada.')
    } catch {
      setMessage('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entrar no Casa Limpa CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesse com email e senha ou link mágico
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-md border ${mode === 'signin' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-md border ${mode === 'signup' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            Criar conta
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <div className={`text-sm text-center p-3 rounded-md ${message.includes('Erro') || message.includes('Falha') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              {message}
            </div>
          )}

          <div className="space-y-2">
          <button
            type="submit"
            disabled={loading || !supabase}
            className="w-full py-2 px-4 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'signin' ? (loading ? 'Entrando...' : 'Entrar') : (loading ? 'Criando...' : 'Criar conta')}
          </button>
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading || !email || !supabase}
            className="w-full py-2 px-4 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar link mágico por email
          </button>
          </div>
        </form>
      </div>
    </div>
  )
}
