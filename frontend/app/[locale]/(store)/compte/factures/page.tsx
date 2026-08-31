"use client";

import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '@/lib/api/invoices';
import { useTranslations } from 'next-intl';
import { FileText, Download } from 'lucide-react';

export default function UserInvoicesPage() {
  const t = useTranslations('Account');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['user-invoices'],
    queryFn: invoicesApi.getAllUser,
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'ISSUED': return 'bg-blue-100 text-blue-700';
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'OVERDUE': return 'bg-red-100 text-red-700';
      case 'CANCELLED': return 'bg-slate-200 text-slate-500 line-through';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'Brouillon';
      case 'ISSUED': return 'Émise';
      case 'PAID': return 'Payée';
      case 'OVERDUE': return 'En retard';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  // Only show issued/paid/overdue invoices to the user, not drafts or cancelled ones unless needed
  const visibleInvoices = invoices?.filter(inv => inv.status !== 'DRAFT');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Mes factures</h1>
        <p className="mt-1 text-sm text-gray-500">Consultez et téléchargez l'historique de vos factures.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">N° Facture</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Montant TTC</th>
                <th className="px-6 py-4 font-medium text-center">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Chargement...</td>
                </tr>
              ) : visibleInvoices?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Vous n'avez aucune facture disponible.</td>
                </tr>
              ) : (
                visibleInvoices?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-primary flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(invoice.issueDate).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {invoice.totalTTC.toFixed(3)} DT
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => invoicesApi.downloadPdfUser(invoice.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Download size={14} /> Télécharger
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
