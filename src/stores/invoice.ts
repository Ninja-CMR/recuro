import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { Invoice, InvoiceItem } from '@/types'

export const useInvoiceStore = defineStore('invoice', () => {
    const invoices = ref<Invoice[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchInvoices = async (force = false) => {
        if (!force && invoices.value.length > 0) return

        loading.value = true
        error.value = null
        try {
            const { data, error: err } = await supabase
                .from('invoices')
                .select('*, client:clients(*)')
                .order('created_at', { ascending: false })

            if (err) throw err
            invoices.value = data || []
        } catch (err: any) {
            console.error('Error fetching invoices:', err)
            error.value = err.message
            invoices.value = []
        } finally {
            loading.value = false
        }
    }

    const createInvoice = async (invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[]) => {
        loading.value = true
        error.value = null

        try {
            const authStore = useAuthStore()
            const currentUser = authStore.user

            if (!currentUser) throw new Error('Utilisateur non authentifié')

            // 1. Create Invoice
            const { data: invoice, error: invoiceErr } = await supabase
                .from('invoices')
                .insert({
                    ...invoiceData,
                    user_id: currentUser.id
                })
                .select()
                .single()

            if (invoiceErr) {
                console.error('Invoice creation error:', invoiceErr);
                throw invoiceErr;
            }

            if (invoice) {
                // 2. Create Items
                const itemsWithId = items.map(item => ({ ...item, invoice_id: invoice.id }))
                const { error: itemsErr } = await supabase.from('invoice_items').insert(itemsWithId)
                if (itemsErr) {
                    console.error('Invoice items creation error:', itemsErr);
                    throw itemsErr;
                }

                invoices.value.unshift(invoice)
                return { data: invoice, error: null }
            }
        } catch (err: any) {
            console.error('Error creating invoice:', err)
            error.value = err.message
            return { data: null, error: err }
        } finally {
            loading.value = false
        }
        return { data: null, error: new Error('Unknown error') }
    }

    const fetchInvoiceById = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            const { data: invoice, error: err } = await supabase
                .from('invoices')
                .select('*, client:clients(*), invoice_items(*)')
                .eq('id', id)
                .single()

            if (err) throw err
            return { data: invoice, error: null }
        } catch (err: any) {
            console.error('Error fetching invoice by ID:', err)
            error.value = err.message
            return { data: null, error: err }
        } finally {
            loading.value = false
        }
    }

    const updateInvoice = async (id: string, invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[]) => {
        loading.value = true
        error.value = null

        try {
            // 1. Update Invoice
            const { data: updatedInvoice, error: invoiceErr } = await supabase
                .from('invoices')
                .update(invoiceData)
                .eq('id', id)
                .select()
                .single()

            if (invoiceErr) {
                console.error('Invoice update error:', invoiceErr);
                throw invoiceErr;
            }

            if (updatedInvoice) {
                // 2. Delete existing items
                const { error: deleteItemsErr } = await supabase
                    .from('invoice_items')
                    .delete()
                    .eq('invoice_id', id)

                if (deleteItemsErr) {
                    console.error('Invoice items deletion error:', deleteItemsErr);
                    throw deleteItemsErr;
                }

                // 3. Insert new items
                const itemsWithId = items.map(item => ({ ...item, invoice_id: updatedInvoice.id }))
                const { error: insertItemsErr } = await supabase.from('invoice_items').insert(itemsWithId)
                if (insertItemsErr) {
                    console.error('Invoice items insertion error:', insertItemsErr);
                    throw insertItemsErr;
                }

                // Update the local store
                const index = invoices.value.findIndex(inv => inv.id === id);
                if (index !== -1) {
                    invoices.value[index] = updatedInvoice;
                }

                return { data: updatedInvoice, error: null }
            }
        } catch (err: any) {
            console.error('Error updating invoice:', err)
            error.value = err.message
            return { data: null, error: err }
        } finally {
            loading.value = false
        }
        return { data: null, error: new Error('Unknown error') }
    }

    const pendingCount = computed(() => invoices.value.filter(i => i.status === 'sent' || i.status === 'draft').length)
    const paidCount = computed(() => invoices.value.filter(i => i.status === 'paid').length)
    const overdueCount = computed(() => invoices.value.filter(i => i.status === 'overdue' || (new Date(i.due_date) < new Date() && i.status !== 'paid')).length)
    const sentCount = computed(() => invoices.value.filter(i => i.status === 'sent').length)

    const totalRevenue = computed(() => invoices.value.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0))

    const reset = () => {
        invoices.value = []
        loading.value = false
        error.value = null
    }

    return { invoices, loading, error, fetchInvoices, createInvoice, fetchInvoiceById, updateInvoice, pendingCount, paidCount, overdueCount, sentCount, totalRevenue, reset }
})
