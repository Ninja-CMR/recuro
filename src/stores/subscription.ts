import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { Subscription } from '@/types'

export const useSubscriptionStore = defineStore('subscription', () => {
    const subscriptions = ref<Subscription[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchSubscriptions = async (force = false) => {
        if (!force && subscriptions.value.length > 0) return

        loading.value = true
        error.value = null
        try {
            const { data, error: err } = await supabase
                .from('subscriptions')
                .select('*, client:clients(*)')
                .order('created_at', { ascending: false })

            if (err) throw err
            subscriptions.value = data || []
        } catch (err: any) {
            console.error('Error fetching subscriptions:', err)
            error.value = err.message
            subscriptions.value = []
        } finally {
            loading.value = false
        }
    }

    const createSubscription = async (subscriptionData: Partial<Subscription>) => {
        loading.value = true
        error.value = null

        try {
            const authStore = useAuthStore()
            const currentUser = authStore.user

            if (!currentUser) throw new Error('Utilisateur non authentifié')

            const { data: subscription, error: subErr } = await supabase
                .from('subscriptions')
                .insert({
                    ...subscriptionData,
                    user_id: currentUser.id
                })
                .select('*, client:clients(*)')
                .single()

            if (subErr) {
                console.error('Subscription creation error:', subErr)
                throw subErr
            }

            if (subscription) {
                subscriptions.value.unshift(subscription)
                return { data: subscription, error: null }
            }
        } catch (err: any) {
            console.error('Error creating subscription:', err)
            error.value = err.message
            return { data: null, error: err }
        } finally {
            loading.value = false
        }
        return { data: null, error: new Error('Unknown error') }
    }

    const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
        loading.value = true
        try {
            const { data, error: err } = await supabase
                .from('subscriptions')
                .update(updates)
                .eq('id', id)
                .select('*, client:clients(*)')
                .single()

            if (err) throw err

            const index = subscriptions.value.findIndex(s => s.id === id)
            if (index !== -1) {
                subscriptions.value[index] = data
            }
            return { data, error: null }
        } catch (err: any) {
            console.error('Error updating subscription:', err)
            return { data: null, error: err }
        } finally {
            loading.value = false
        }
    }

    const deleteSubscription = async (id: string) => {
        loading.value = true
        try {
            const { error: err } = await supabase
                .from('subscriptions')
                .delete()
                .eq('id', id)

            if (err) throw err

            subscriptions.value = subscriptions.value.filter(s => s.id !== id)
            return { error: null }
        } catch (err: any) {
            console.error('Error deleting subscription:', err)
            return { error: err }
        } finally {
            loading.value = false
        }
    }

    const fetchSubscriptionById = async (id: string) => {
        try {
            const { data, error: err } = await supabase
                .from('subscriptions')
                .select('*, client:clients(*)')
                .eq('id', id)
                .single()
            if (err) throw err
            return { data, error: null }
        } catch (err: any) {
            console.error('Error fetching subscription:', err)
            return { data: null, error: err }
        }
    }

    const reset = () => {
        subscriptions.value = []
        loading.value = false
        error.value = null
    }

    return { subscriptions, loading, error, fetchSubscriptions, createSubscription, updateSubscription, deleteSubscription, fetchSubscriptionById, reset }
})
