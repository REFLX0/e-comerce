"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, Invoice, InvoiceLine } from '@/lib/api/invoices';
import { adminApi } from '@/lib/api/admin';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash, Download, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminInvoiceEditorPage({ params: { id, locale } }: { params: { id: string; locale: string } }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [form, setForm] = useState<Partial<Invoice>>({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientMf: '',
    status: 'DRAFT',
    lines: [],
    notes: '',
  });

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['admin-invoice', id],
    queryFn: () => invoicesApi.getOneAdmin(id),
    enabled: !isNew,
  });

  useEffect(() => {
    if (invoice && !isNew) {
      setForm(invoice);
    }
  }, [invoice, isNew]);

  const { data: customers } = useQuery({
    queryKey: ['admin-customers-minimal'],
    queryFn: async () => {
      const res = (await adminApi.getUsers({ limit: 1000, role: 'CUSTOMER' })) as any;
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Invoice>) => isNew ? invoicesApi.create(data) : invoicesApi.update(id, data),
    onSuccess: (savedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success(isNew ? 'Facture créée avec succès' : 'Facture mise à jour');
      if (isNew) {
        router.push(`/${locale}/admin/invoices/${savedInvoice.id}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ['admin-invoice', id] });
      }
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  });

  const handleSave = () => {
    if (!form.clientName) {
      return toast.error('Le nom du client est requis');
    }
    if (!form.lines || form.lines.length === 0) {
      return toast.error('Au moins une ligne de facturation est requise');
    }
    saveMutation.mutate(form);
  };

  const addLine = () => {
    setForm(prev => ({
      ...prev,
      lines: [...(prev.lines || []), { description: '', quantity: 1, unitPriceHT: 0, vatRate: 0.19 }]
    }));
  };

  const updateLine = (index: number, field: keyof InvoiceLine, value: any) => {
    const newLines = [...(form.lines || [])];
    newLines[index] = { ...newLines[index], [field]: value } as any;
    setForm(prev => ({ ...prev, lines: newLines }));
  };

  const removeLine = (index: number) => {
    const newLines = [...(form.lines || [])];
    newLines.splice(index, 1);
    setForm(prev => ({ ...prev, lines: newLines }));
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    if (!custId) return;
    const cust = customers?.find((c: any) => c.id === custId);
    if (cust) {
      setForm(prev => ({
        ...prev,
        customerId: cust.id,
        clientName: `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || cust.name || '',
        clientEmail: cust.email,
        clientPhone: cust.phone || '',
      }));
    }
  };

  if (isLoading && !isNew) return <div className="p-10 text-center text-gray-500">Chargement...</div>;

  const isReadOnly = form.status !== 'DRAFT' && !isNew;

  // Calculs dynamiques
  const subtotalHT = (form.lines || []).reduce((acc, line) => acc + (line.quantity * line.unitPriceHT), 0);
  const totalTVA = (form.lines || []).reduce((acc, line) => acc + (line.quantity * line.unitPriceHT * line.vatRate), 0);
  const totalTTC = subtotalHT + totalTVA;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin/invoices`} className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-brand-primary transition-colors shadow-sm">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">
              {isNew ? 'Nouvelle Facture' : form.invoiceNumber || 'Brouillon'}
            </h1>
            <p className="text-sm text-gray-500">
              {isNew ? 'Créez une facture pour un client' : `Créée le ${format(new Date(form.createdAt || Date.now()), 'dd/MM/yyyy')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={() => invoicesApi.downloadPdfAdmin(id)}
              className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download size={16} /> PDF
            </button>
          )}
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-black hover:bg-brand-accent-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={16} />
              Enregistrer
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COL GAUCHE : INFOS CLIENT */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-brand-primary flex items-center gap-2">
              <FileText size={18} className="text-gray-400" /> Informations Légales
            </h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Statut</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
                disabled={isReadOnly}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-accent disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="ISSUED">Émise</option>
                <option value="PAID">Payée</option>
                <option value="OVERDUE">En retard</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Date d'échéance</label>
              <input
                type="date"
                value={form.dueDate ? new Date(form.dueDate).toISOString().split('T')[0] : ''}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                disabled={isReadOnly}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-brand-primary">Client (B2B / B2C)</h2>
            
            {!isReadOnly && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Charger depuis la base</label>
                <select
                  onChange={handleCustomerSelect}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent"
                >
                  <option value="">Sélectionner un utilisateur inscrit...</option>
                  {customers?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-gray-500">Nom du client / Raison sociale *</label>
              <input
                type="text"
                value={form.clientName || ''}
                onChange={e => setForm({ ...form, clientName: e.target.value })}
                disabled={isReadOnly}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent disabled:bg-gray-50"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Matricule Fiscal (B2B)</label>
              <input
                type="text"
                value={form.clientMf || ''}
                onChange={e => setForm({ ...form, clientMf: e.target.value })}
                disabled={isReadOnly}
                placeholder="Ex: 1234567/A/B/M/000"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent disabled:bg-gray-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Adresse de facturation</label>
              <textarea
                value={form.clientAddress || ''}
                onChange={e => setForm({ ...form, clientAddress: e.target.value })}
                disabled={isReadOnly}
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent resize-none disabled:bg-gray-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <input
                  type="email"
                  value={form.clientEmail || ''}
                  onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent disabled:bg-gray-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Téléphone</label>
                <input
                  type="tel"
                  value={form.clientPhone || ''}
                  onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COL DROITE : LIGNES DE FACTURE */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-brand-primary">Lignes de facturation</h2>
              {!isReadOnly && (
                <button
                  onClick={addLine}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Plus size={14} /> Ajouter une ligne
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium w-full">Désignation</th>
                    <th className="px-3 py-2 font-medium w-24">Qté</th>
                    <th className="px-3 py-2 font-medium w-32">Prix HT</th>
                    <th className="px-3 py-2 font-medium w-24">TVA</th>
                    <th className="px-3 py-2 font-medium w-32 text-right">Total TTC</th>
                    {!isReadOnly && <th className="px-2 py-2"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {form.lines?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">Aucune ligne. Ajoutez-en une.</td>
                    </tr>
                  ) : form.lines?.map((line, idx) => {
                    const lineTTC = line.quantity * line.unitPriceHT * (1 + line.vatRate);
                    return (
                      <tr key={idx}>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={line.description}
                            onChange={e => updateLine(idx, 'description', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="Produit..."
                            className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand-accent disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={e => updateLine(idx, 'quantity', parseInt(e.target.value) || 0)}
                            disabled={isReadOnly}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm text-center outline-none focus:border-brand-accent disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={line.unitPriceHT}
                            onChange={e => updateLine(idx, 'unitPriceHT', parseFloat(e.target.value) || 0)}
                            disabled={isReadOnly}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm text-right outline-none focus:border-brand-accent disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={line.vatRate}
                            onChange={e => updateLine(idx, 'vatRate', parseFloat(e.target.value))}
                            disabled={isReadOnly}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand-accent disabled:bg-transparent disabled:border-transparent appearance-none"
                          >
                            <option value={0}>0%</option>
                            <option value={0.07}>7%</option>
                            <option value={0.13}>13%</option>
                            <option value={0.19}>19%</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">
                          {lineTTC.toFixed(3)}
                        </td>
                        {!isReadOnly && (
                          <td className="px-2 py-2 text-right">
                            <button
                              onClick={() => removeLine(idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total HT</span>
                  <span>{subtotalHT.toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total TVA</span>
                  <span>{totalTVA.toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-brand-primary pt-2 border-t border-gray-100">
                  <span>Total TTC</span>
                  <span>{totalTTC.toFixed(3)} DT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
            <h2 className="font-bold text-brand-primary text-sm">Notes & Conditions (affichées sur la facture)</h2>
            <textarea
              value={form.notes || ''}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              disabled={isReadOnly}
              rows={3}
              placeholder="Ex: Paiement à 30 jours..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent resize-none disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
