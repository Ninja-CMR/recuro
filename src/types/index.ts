export interface Client {
    id: string
    user_id: string
    name: string
    email?: string
    address?: string
    created_at: string
}

export interface Invoice {
    id: string
    user_id: string
    client_id: string
    status: 'draft' | 'sent' | 'paid' | 'overdue'
    issue_date: string
    due_date: string
    total_amount: number
    created_at: string
    client?: Client // For joined queries
}

export interface InvoiceItem {
    id: string
    invoice_id: string
    description: string
    quantity: number
    unit_price: number
    amount: number
}

export interface Subscription {
    id: string
    user_id: string
    client_id: string
    name: string
    description?: string
    amount: number
    currency: string
    frequency: 'monthly' | 'quarterly' | 'yearly'
    start_date: string
    end_date?: string
    status: 'active' | 'inactive' | 'cancelled' | 'pending'
    created_at: string
    client?: Client // For joined queries
}

