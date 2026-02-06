import { loadStripe } from '@stripe/stripe-js'

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

export const getStripe = async () => {
    if (!stripePublicKey) {
        console.warn('Stripe Public Key is missing.')
        return null
    }
    return await loadStripe(stripePublicKey)
}
