export const currencies = [
    { value: 'XAF', label: 'Franc CFA (FCFA)', symbol: 'FCFA', rate: 655.957 },
    { value: 'EUR', label: 'Euro (€)', symbol: '€', rate: 1 },
    { value: 'USD', label: 'Dollar US ($)', symbol: '$', rate: 1.085 },
    { value: 'JPY', label: 'Yen Japonais (¥)', symbol: '¥', rate: 164 }
]

export function getCurrencySymbol(value?: string) {
    const cur = currencies.find(c => c.value === value)
    return cur ? cur.symbol : 'FCFA'
}

export function formatAmount(amount: number, currencyValue?: string) {
    const symbol = getCurrencySymbol(currencyValue)
    return `${Math.round(amount)} ${symbol}`
}

export function convertAmount(amount: number, fromCurrency: string, toCurrency: string) {
    if (fromCurrency === toCurrency) return amount

    const from = currencies.find(c => c.value === fromCurrency)
    const to = currencies.find(c => c.value === toCurrency)

    if (!from || !to) return amount

    // Convert to base (EUR) then to target
    const inBase = amount / from.rate
    return inBase * to.rate
}
