import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'
import { useInvoiceStore } from './invoice'
import { useClientStore } from './client'
import { useSubscriptionStore } from './subscription'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const loading = ref(true)

    const fetchUser = async () => {
        loading.value = true
        try {
            const { data, error } = await supabase.auth.getUser()
            if (error) throw error
            user.value = data.user
            if (data.user) {
                await fetchProfile(data.user.id)
            }
        } catch (err: any) {
            // Silence "Auth session missing" errors as they are normal for logged-out users
            if (err?.name !== 'AuthSessionMissingError') {
                console.error('Fetch user error:', err)
            }
            user.value = null
        } finally {
            loading.value = false
        }
    }

    const profile = ref<any>(null)

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error: profileErr } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (profileErr) {
                // If no profile found, don't treat it as a scary error
                if (profileErr.code === 'PGRST116') {
                    profile.value = null
                    return
                }
                throw profileErr
            }
            profile.value = data
        } catch (err) {
            console.error('Error fetching profile:', err)
            profile.value = null
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        user.value = null
        profile.value = null

        // Reset all stores to clear sensitive data
        useInvoiceStore().reset()
        useClientStore().reset()
        useSubscriptionStore().reset()
    }

    const userProfile = computed(() => {
        if (!user.value) return null
        return {
            email: user.value.email,
            full_name: profile.value?.full_name || user.value.user_metadata?.full_name || 'Utilisateur',
            company_name: profile.value?.company_name,
            address: profile.value?.address,
            subscription_tier: 'premium',
            initials: (profile.value?.full_name || user.value.user_metadata?.full_name || 'U')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
    })

    return { user, profile, loading, fetchUser, fetchProfile, signOut, userProfile }
})
