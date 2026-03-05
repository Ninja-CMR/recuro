import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isPlaceholder } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const loading = ref(true)

    const fetchUser = async () => {
        // In placeholder mode, if we manually set a user (demo), don't overwrite it
        if (isPlaceholder && user.value?.id === 'demo-user') {
            loading.value = false
            return
        }

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
    }

    const userProfile = computed(() => {
        if (!user.value) return null
        return {
            email: user.value.email,
            full_name: profile.value?.full_name || user.value.user_metadata?.full_name || 'Utilisateur',
            company_name: profile.value?.company_name,
            address: profile.value?.address,
            subscription_tier: profile.value?.subscription_tier || 'freemium',
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
