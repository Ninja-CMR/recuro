import { useAuthStore } from '@/stores/auth'
import { useInvoiceStore } from '@/stores/invoice'
import { mailService } from '@/services/mailService'
import type { Invoice, Client } from '@/types'

export const useSendInvoice = () => {
    const authStore = useAuthStore()
    const invoiceStore = useInvoiceStore()

    const formatInvoiceMessage = (invoice: Invoice, client: Client) => {
        const id = invoice?.id || ''
        const invoiceId = (id.split('-')[0] || 'INV').toUpperCase()
        const amount = (invoice?.total_amount || 0).toFixed(2)
        const companyName = authStore.userProfile?.company_name || 'RECURO'

        return `Bonjour ${client.name},\n\nVoici votre facture #${invoiceId} d'un montant de ${amount} €. \n\nVous pouvez nous contacter pour toute question.\n\nMerci pour votre confiance !\n\nL'équipe ${companyName}`
    }

    const sendViaEmail = async (invoice: Invoice, client: Client) => {
        const id = invoice?.id || ''
        const invoiceId = (id.split('-')[0] || 'INV').toUpperCase()
        const companyName = authStore.userProfile?.company_name || 'RECURO'
        const message = formatInvoiceMessage(invoice, client)

        // Mark as sent in DB if it's a draft
        if (invoice.status === 'draft') {
            await invoiceStore.updateInvoice(invoice.id, { status: 'sent' }, (invoice as any).invoice_items)
        }

        const { data, error } = await mailService.sendInvoice({
            to: client.email || '',
            subject: `Facture #${invoiceId} - ${companyName}`,
            invoiceData: invoice
        })

        if (error || (data && (data as any).manual)) {
            // Manual fallback to mailto
            const subject = encodeURIComponent(`Facture #${invoiceId} - ${companyName}`)
            const body = encodeURIComponent(message)
            window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`
            return { success: true, manual: true }
        }

        return { success: !error, error, manual: false }
    }

    const sendViaWhatsApp = async (invoice: Invoice, client: Client) => {
        if (!client.phone) throw new Error('Numéro de téléphone requis pour WhatsApp')

        const message = formatInvoiceMessage(invoice, client)
        const text = encodeURIComponent(message)
        const cleanPhone = client.phone.replace(/\D/g, '')

        // Mark as sent in DB
        if (invoice.status === 'draft') {
            await invoiceStore.updateInvoice(invoice.id, { status: 'sent' }, (invoice as any).invoice_items)
        }

        window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
        return { success: true, manual: false }
    }

    const sendViaSMS = async (invoice: Invoice, client: Client) => {
        if (!client.phone) throw new Error('Numéro de téléphone requis pour SMS')

        const message = formatInvoiceMessage(invoice, client)
        const body = encodeURIComponent(message)
        const cleanPhone = client.phone.replace(/\D/g, '')

        // Mark as sent in DB
        if (invoice.status === 'draft') {
            await invoiceStore.updateInvoice(invoice.id, { status: 'sent' }, (invoice as any).invoice_items)
        }

        window.location.href = `sms:${cleanPhone}&body=${body}`
        return { success: true, manual: false }
    }

    const sendInvoice = async (invoice: Invoice, method?: 'email' | 'whatsapp' | 'iphone'): Promise<{ success: boolean; manual?: boolean; error?: any }> => {
        const client = invoice?.client
        if (!client) throw new Error('Client non trouvé')

        const activeMethod = method || client.preferred_method || 'email'

        switch (activeMethod) {
            case 'whatsapp':
                return sendViaWhatsApp(invoice, client)
            case 'iphone':
                return sendViaSMS(invoice, client)
            case 'email':
            default:
                return sendViaEmail(invoice, client)
        }
    }

    return {
        sendInvoice,
        sendViaEmail,
        sendViaWhatsApp,
        sendViaSMS
    }
}
