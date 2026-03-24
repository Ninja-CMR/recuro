import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/layouts/PublicLayout.vue'),
            children: [
                {
                    path: '',
                    name: 'home',
                    component: () => import('@/pages/PublicHome.vue')
                },
                {
                    path: 'login',
                    name: 'login',
                    component: () => import('@/pages/auth/Login.vue')
                },
                {
                    path: 'register',
                    name: 'register',
                    component: () => import('@/pages/auth/Register.vue')
                },
                {
                    path: 'p/invoice/:id',
                    name: 'public-invoice',
                    component: () => import('@/pages/public/PublicInvoiceDetail.vue')
                }
            ]
        },
        {
            path: '/',
            component: () => import('@/layouts/AppLayout.vue'),
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/Dashboard.vue')
                },
                {
                    path: 'clients',
                    name: 'clients',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/clients/ClientsList.vue')
                },
                {
                    path: 'invoices',
                    name: 'invoices',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/invoices/InvoiceList.vue')
                },
                {
                    path: 'invoices/new',
                    name: 'new-invoice',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/invoices/InvoiceBuilder.vue')
                },
                {
                    path: 'invoices/:id', // Detail view
                    name: 'invoice-detail',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/invoices/InvoiceDetail.vue')
                },
                {
                    path: 'invoices/:id/edit', // Edit view
                    name: 'edit-invoice',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/invoices/InvoiceBuilder.vue')
                },
                {
                    path: 'subscriptions',
                    name: 'subscriptions',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/subscriptions/SubscriptionList.vue')
                },
                {
                    path: 'subscriptions/new', // New route for creating subscriptions
                    name: 'new-subscription',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/subscriptions/SubscriptionBuilder.vue')
                },
                {
                    path: 'subscriptions/:id/edit',
                    name: 'edit-subscription',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/subscriptions/SubscriptionBuilder.vue')
                },
                {
                    path: 'settings',
                    name: 'settings',
                    meta: { requiresAuth: true },
                    component: () => import('@/pages/Settings.vue')
                }
            ]
        }
    ]
})

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()
    if (authStore.loading) {
        await authStore.fetchUser()
    }

    if (to.meta.requiresAuth && !authStore.user) {
        next({ name: 'login' })
    } else if ((to.name === 'login' || to.name === 'register') && authStore.user) {
        next({ name: 'dashboard' })
    } else if (to.path === '/' && authStore.user) {
        next({ name: 'dashboard' })
    } else {
        next()
    }
})

export default router
