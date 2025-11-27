'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
// Ícones desabilitados temporariamente para evitar erro de SSR
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

const navigation = [
  { name: 'Dashboard', href: '/', icon: undefined as any },
  { name: 'Clientes', href: '/clientes', icon: undefined as any },
  { name: 'Agendamentos', href: '/agendamentos', icon: undefined as any },
  { name: 'Orçamentos', href: '/orcamentos', icon: undefined as any },
  { name: 'Faturas', href: '/faturas', icon: undefined as any },
  { name: 'Funcionários', href: '/funcionarios', icon: undefined as any },
  { name: 'Relatórios', href: '/relatorios', icon: undefined as any },
  { name: 'Fluxo de Caixa', href: '/fluxo-caixa', icon: undefined as any },
  { name: 'Configurações', href: '/configuracoes', icon: undefined as any },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 md:gap-6 py-3 md:py-4">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Casa Limpa CRM</h1>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-start overflow-x-auto whitespace-nowrap sm:justify-center md:flex-wrap md:overflow-visible md:whitespace-normal gap-x-3 md:gap-x-6 lg:gap-x-10 md:gap-y-2">
              {navigation.slice(0, 5).map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    className={`$
                      isActive
                        ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
                    } inline-flex items-center px-2 md:px-3 py-1.5 border-b-2 text-sm md:text-sm lg:text-base font-medium`}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center px-2 md:px-3 py-1.5 border-b-2 text-sm md:text-sm lg:text-base font-medium`}
                >
                  <span className="h-4 w-4 mr-2">▼</span>
                  Mais
                </button>
                {moreOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {navigation.slice(5).map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            prefetch={false}
                            className={`$
                              isActive
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                            } flex items-center px-3 py-2 text-sm font-medium`}
                            onClick={() => setMoreOpen(false)}
                          >
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="h-4 w-4 mr-2">⎋</span>
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
