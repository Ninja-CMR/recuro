import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const loading = ref(true)

    const fetchUser = async () => {
        loading.value = true
        const { data } = await supabase.auth.getUser()
        user.value = data.user
        loading.value = false
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        user.value = null
    }

    const userProfile = computed(() => {
        if (!user.value) return null
        return {
            email: user.value.email,
            full_name: user.value.user_metadata?.full_name || 'Utilisateur',
            initials: (user.value.user_metadata?.full_name || 'U')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
    })

    return { user, loading, fetchUser, signOut, userProfile }
})
