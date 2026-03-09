// Manual email service for MVP

export interface MailOptions {
    to: string
    subject?: string
    invoiceData?: any
}

export const mailService = {
    async sendInvoice(options: MailOptions) {
        try {
            console.log('Manual email sending requested for:', options.to)

            // For MVP, we default to manual sending (mailto:)
            // This avoids domain/SMTP issues for the user
            return { data: { manual: true }, error: null }
        } catch (error: any) {
            console.error('Error in mail service:', error)
            return { data: null, error: error.message || 'Erreur lors de la préparation de l\'email' }
        }
    }
}
