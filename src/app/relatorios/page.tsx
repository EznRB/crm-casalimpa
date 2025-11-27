'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, FileText, Calendar, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ReportFilters {
  startDate: string;
  endDate: string;
  type: 'appointments' | 'customers' | 'financial';
  format: 'csv' | 'pdf';
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'appointments',
    format: 'csv'
  });
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);

      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (filters.type) {
        case 'appointments':
          const { data: appointments } = await supabase
            .from('appointments')
            .select(`
              *,
              customer:customers(name, email, phone),
              service:services(name, price)
            `)
            .gte('date', start.toISOString())
            .lte('date', end.toISOString())
            .order('date', { ascending: true });
          
          data = appointments || [];
          filename = `appointments-${filters.startDate}-to-${filters.endDate}`;
          headers = ['Date', 'Time', 'Customer', 'Service', 'Price', 'Status', 'Notes'];
          break;

        case 'customers':
          const { data: customers } = await supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true });
          
          data = customers || [];
          filename = `customers-${new Date().toISOString().split('T')[0]}`;
          headers = ['Name', 'Email', 'Phone', 'Address', 'Created Date'];
          break;

        case 'financial':
          const { data: invoices } = await supabase
            .from('invoices')
            .select(`
              *,
              appointment:appointments(*, customer:customers(name), service:services(name, price))
            `)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .order('created_at', { ascending: true });
          
          data = invoices || [];
          filename = `financial-${filters.startDate}-to-${filters.endDate}`;
          headers = ['Date', 'Invoice #', 'Customer', 'Service', 'Amount', 'Status'];
          break;
      }

      if (filters.format === 'csv') {
        generateCSV(data, headers, filename, filters.type);
      } else {
        generatePDF(data, headers, filename, filters.type);
      }

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (data: any[], headers: string[], filename: string, type: string) => {
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
      let row: string[] = [];
      
      switch (type) {
        case 'appointments':
          row = [
            new Date(item.date).toLocaleDateString('pt-BR'),
            item.time,
            item.customer?.name || '',
            item.service?.name || '',
            `R$ ${(item.service?.price || 0).toFixed(2)}`,
            item.status,
            item.notes || ''
          ];
          break;
        case 'customers':
          row = [
            item.name,
            item.email,
            item.phone,
            item.address || '',
            new Date(item.created_at).toLocaleDateString('pt-BR')
          ];
          break;
        case 'financial':
          row = [
            new Date(item.created_at).toLocaleDateString('pt-BR'),
            item.invoice_number,
            item.appointment?.customer?.name || '',
            item.appointment?.service?.name || '',
            `R$ ${item.amount.toFixed(2)}`,
            item.status
          ];
          break;
      }
      
      csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = async (data: any[], headers: string[], filename: string, type: string) => {
    try {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          headers,
          title: getReportTitle(type),
          dateRange: `${filters.startDate} to ${filters.endDate}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const getReportTitle = (type: string) => {
    switch (type) {
      case 'appointments': return 'Relatório de Agendamentos';
      case 'customers': return 'Relatório de Clientes';
      case 'financial': return 'Relatório Financeiro';
      default: return 'Relatório';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
        <p className="text-gray-600">Gere relatórios personalizados sobre agendamentos, clientes e finanças</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="appointments"
                  checked={filters.type === 'appointments'}
                  onChange={(e) => setFilters({...filters, type: e.target.value as any})}
                  className="mr-2"
                />
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                <span>Agendamentos</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="customers"
                  checked={filters.type === 'customers'}
                  onChange={(e) => setFilters({...filters, type: e.target.value as any})}
                  className="mr-2"
                />
                <Users className="w-4 h-4 mr-2 text-green-600" />
                <span>Clientes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="financial"
                  checked={filters.type === 'financial'}
                  onChange={(e) => setFilters({...filters, type: e.target.value as any})}
                  className="mr-2"
                />
                <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
                <span>Financeiro</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={filters.format === 'csv'}
                  onChange={(e) => setFilters({...filters, format: e.target.value as any})}
                  className="mr-2"
                />
                <FileText className="w-4 h-4 mr-2 text-gray-600" />
                <span>CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={filters.format === 'pdf'}
                  onChange={(e) => setFilters({...filters, format: e.target.value as any})}
                  className="mr-2"
                />
                <FileText className="w-4 h-4 mr-2 text-red-600" />
                <span>PDF</span>
              </label>
            </div>
          </div>
        </div>

        {(filters.type === 'appointments' || filters.type === 'financial') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <span>Gerando relatório...</span>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </>
          )}
        </button>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Relatórios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Agendamentos</h3>
            <p className="text-sm text-gray-600">Relatório detalhado de todos os agendamentos no período selecionado</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Clientes</h3>
            <p className="text-sm text-gray-600">Lista completa de todos os clientes cadastrados</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Financeiro</h3>
            <p className="text-sm text-gray-600">Relatório financeiro com todas as faturas do período</p>
          </div>
        </div>
      </div>
    </div>
  );
}