import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { Invoice, InvoiceItem } from '@/types'

export const useInvoiceStore = defineStore('invoice', () => {
    const invoices = ref<Invoice[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchInvoices = async () => {
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
            const { data: userData } = await supabase.auth.getUser()

            // 1. Create Invoice
            const { data: invoice, error: invoiceErr } = await supabase
                .from('invoices')
                .insert({
                    ...invoiceData,
                    user_id: userData.user?.id
                })
                .select()
                .single()

            if (invoiceErr) throw invoiceErr

            if (invoice) {
                // 2. Create Items
                const itemsWithId = items.map(item => ({ ...item, invoice_id: invoice.id }))
                await supabase.from('invoice_items').insert(itemsWithId)

                invoices.value.unshift(invoice)
                return { data: invoice }
            }
        } catch (err: any) {
            error.value = err.message
            return { error: err }
        } finally {
            loading.value = false
        }
        return { error: 'Unknown error' }
    }

    const pendingCount = computed(() => invoices.value.filter(i => i.status === 'sent' || i.status === 'draft').length)
    const paidCount = computed(() => invoices.value.filter(i => i.status === 'paid').length)
    const overdueCount = computed(() => invoices.value.filter(i => i.status === 'overdue' || (new Date(i.due_date) < new Date() && i.status !== 'paid')).length)
    const sentCount = computed(() => invoices.value.filter(i => i.status === 'sent').length)

    const totalRevenue = computed(() => invoices.value.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0))

    return { invoices, loading, error, fetchInvoices, createInvoice, pendingCount, paidCount, overdueCount, sentCount, totalRevenue }
})
