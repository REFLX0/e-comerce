"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/lib/api/invoices';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Search, FileText, Copy, Trash, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminInvoicesPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: invoicesApi.getAllAdmin,
  });

  const duplicateMutation = useMutation({
    mutationFn: invoicesApi.duplicate,
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success('Facture dupliquée avec succès');
      router.push(`/${locale}/admin/invoices/${newInvoice.id}`);
    },
    onError: () => toast.error('Erreur lors de la duplication'),
  });

  const removeMutation = useMutation({
    mutationFn: invoicesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success('Facture supprimée/annulée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const filtered = invoices?.filter(inv => 
    inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    inv.clientName?.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Factures</h1>
          <p className="text-sm text-gray-500">Gérez vos factures clients et générez des documents légaux.</p>
        </div>
        <Link
          href={`/${locale}/admin/invoices/new`}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-black hover:bg-brand-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} />
          Créer une facture
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-accent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">N° Facture</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Montant TTC</th>
                <th className="px-6 py-4 font-medium text-center">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Chargement...</td>
                </tr>
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Aucune facture trouvée</td>
                </tr>
              ) : (
                filtered?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/${locale}/admin/invoices/${invoice.id}`} className="font-semibold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        {invoice.invoiceNumber || 'Brouillon'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {invoice.clientName}
                      {invoice.clientMf && <span className="block text-[10px] text-gray-400 font-normal">MF: {invoice.clientMf}</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(invoice.issueDate).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => invoicesApi.downloadPdfAdmin(invoice.id)}
                          className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => duplicateMutation.mutate(invoice.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Dupliquer"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if(confirm('Êtes-vous sûr de vouloir supprimer/annuler cette facture ?')) {
                              removeMutation.mutate(invoice.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer / Annuler"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
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
