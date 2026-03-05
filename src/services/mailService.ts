import { supabase } from './supabase'

export interface MailOptions {
    to: string
    subject: string
    invoiceData: any
}

export const mailService = {
    async sendInvoice(options: MailOptions) {
        try {
            const { data, error } = await supabase.functions.invoke('send-invoice', {
                body: {
                    to: options.to,
                    subject: options.subject,
                    invoice: options.invoiceData
                }
            })

            if (error) throw error
            return { data, error: null }
        } catch (error: any) {
            console.error('Error sending email:', error)
            return { data: null, error: error.message || 'Erreur lors de l\'envoi de l\'email' }
        }
    }
}
