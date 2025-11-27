'use client'

import { useEffect, useState } from 'react'
import { getCompany, saveCompany } from '@/lib/db'
import { Save, Building2, Mail, Phone, Contact, MapPin, CreditCard, Image as ImageIcon } from 'lucide-react'

interface Company {
  id?: string
  name: string
  cnpj: string | null
  phone: string
  email: string
  address: {
    street?: string
    number?: string
    neighborhood?: string
    city?: string
    state?: string
    zipcode?: string
  }
  bank_info: {
    bank_name?: string
    agency?: string
    account?: string
    pix_key?: string
  } | null
  logo_url: string | null
  updated_at?: string
}

export default function ConfiguracoesPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    try {
      const row = await getCompany()
      if (row) {
        setCompany({
          id: row.id,
          name: row.name || '',
          cnpj: row.cnpj || null,
          phone: row.phone || '',
          email: row.email || '',
          address: (row as any).address || {},
          bank_info: (row as any).bank_info || null,
          logo_url: row.logo_url || null,
          updated_at: row.updated_at
        })
      } else {
        setCompany({
          name: '',
          cnpj: null,
          phone: '',
          email: '',
          address: {},
          bank_info: null,
          logo_url: null
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const updateField = (path: string, value: any) => {
    setCompany((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      const parts = path.split('.')
      let obj: any = next
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i]
        obj[key] = obj[key] ?? {}
        obj = obj[key]
      }
      obj[parts[parts.length - 1]] = value
      return next
    })
  }

  const saveCompanyAction = async () => {
    if (!company) return
    setSaving(true)
    try {
      const saved = await saveCompany(company as any)
      setCompany({ ...company, id: saved.id })
      alert('Configurações salvas com sucesso')
    } catch (e) {
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
        <button
          onClick={saveCompanyAction}
          disabled={saving}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Building2 className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Dados da Empresa</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                <div className="relative">
                  <Contact className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={company.cnpj || ''}
                    onChange={(e) => updateField('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="mt-1 block w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={company.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(00) 0000-0000"
                      className="mt-1 block w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={company.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="mt-1 block w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Endereço</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rua</label>
                  <input
                    type="text"
                    value={company.address?.street || ''}
                    onChange={(e) => updateField('address.street', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número</label>
                  <input
                    type="text"
                    value={company.address?.number || ''}
                    onChange={(e) => updateField('address.number', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bairro</label>
                <input
                  type="text"
                  value={company.address?.neighborhood || ''}
                  onChange={(e) => updateField('address.neighborhood', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade</label>
                  <input
                    type="text"
                    value={company.address?.city || ''}
                    onChange={(e) => updateField('address.city', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <input
                    type="text"
                    value={company.address?.state || ''}
                    onChange={(e) => updateField('address.state', e.target.value)}
                    placeholder="UF"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CEP</label>
                  <input
                    type="text"
                    value={company.address?.zipcode || ''}
                    onChange={(e) => updateField('address.zipcode', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Informações Bancárias</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Banco</label>
                  <input
                    type="text"
                    value={company.bank_info?.bank_name || ''}
                    onChange={(e) => updateField('bank_info.bank_name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agência</label>
                  <input
                    type="text"
                    value={company.bank_info?.agency || ''}
                    onChange={(e) => updateField('bank_info.agency', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Conta</label>
                  <input
                    type="text"
                    value={company.bank_info?.account || ''}
                    onChange={(e) => updateField('bank_info.account', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PIX</label>
                  <input
                    type="text"
                    value={company.bank_info?.pix_key || ''}
                    onChange={(e) => updateField('bank_info.pix_key', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <ImageIcon className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Marca</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">URL do Logo</label>
                <input
                  type="text"
                  value={company.logo_url || ''}
                  onChange={(e) => updateField('logo_url', e.target.value)}
                  placeholder="https://..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              {company.logo_url ? (
                <div className="border rounded-md p-4 bg-gray-50">
                  <img src={company.logo_url} alt="Logo" className="h-16" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
