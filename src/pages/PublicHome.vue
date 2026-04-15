<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  AlertCircle,
  Clock, 
  Smartphone, 
  Globe,
  ChevronDown,
  Users,
  Briefcase,
  Plus,
  Send,
  Loader2
} from 'lucide-vue-next'

import { useHeroAnimation } from '@/composables/useHeroAnimation'
import dashboardMockup from '@/assets/images/dashboard-mockup.png'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()
const { initHeroAnimations } = useHeroAnimation()

// --- Contact Form Logic ---
const contactName = ref('')
const contactEmail = ref('')
const contactMessage = ref('')
const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')

const handleContactSubmit = async () => {
  if (!contactName.value || !contactEmail.value || !contactMessage.value) {
    submitStatus.value = 'error'
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return
  }

  isSubmitting.value = true
  submitStatus.value = 'idle'
  
  try {
    const { error } = await supabase.functions.invoke('contact-form', {
      body: { 
        name: contactName.value, 
        email: contactEmail.value, 
        message: contactMessage.value 
      }
    })

    if (error) throw error

    submitStatus.value = 'success'
    contactName.value = ''
    contactEmail.value = ''
    contactMessage.value = ''
  } catch (err: any) {
    console.error('Error submitting contact form:', err)
    submitStatus.value = 'error'
    errorMessage.value = err.message || 'Une erreur est survenue lors de l\'envoi du message.'
  } finally {
    isSubmitting.value = false
    // Reset status after a few seconds
    setTimeout(() => {
      if (submitStatus.value === 'success') submitStatus.value = 'idle'
    }, 5000)
  }
}

onMounted(() => {
  // --- 1️⃣ Hero Animations ---
  initHeroAnimations()

  // --- 2️⃣ Problem -> Solution ScrollTrigger ---
  gsap.from('.problem-item', {
    scrollTrigger: {
      trigger: '.problem-section',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    },
    x: -50,
    opacity: 0,
    filter: 'blur(10px)',
    duration: 1,
    stagger: 0.3
  })

  gsap.from('.solution-item', {
    scrollTrigger: {
      trigger: '.problem-section',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    x: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.3
  })

  // Vertical progress bar
  gsap.from('.scroll-line-inner', {
    scrollTrigger: {
      trigger: '.problem-section',
      start: 'top center',
      end: 'bottom center',
      scrub: true
    },
    scaleY: 0,
    transformOrigin: 'top center'
  })

  // --- 4️⃣ Personas Stagger ---
  gsap.from('.persona-card', {
    scrollTrigger: {
      trigger: '.persona-section',
      start: 'top 80%',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out'
  })
  // --- 6️⃣ Process Section (Per-card staggered reveal) ---
  gsap.utils.toArray('.process-card').forEach((card, i) => {
    gsap.from(card as Element, {
      scrollTrigger: {
        trigger: card as Element,
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.1, // Slight stagger if triggered together
      ease: 'power2.out'
    })
  })

  // Mockup reveal
  gsap.from('.process-mockup', {
    scrollTrigger: {
      trigger: '.process-mockup',
      start: 'top 85%',
    },
    y: 50,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out'
  })

  // Refresh ScrollTrigger after a short delay to ensure layout is final
  setTimeout(() => {
    ScrollTrigger.refresh()
  }, 1000)
})

const features = [
  { title: 'Multi-devises', desc: 'Facturez vos clients partout dans le monde.', icon: Globe },
  { title: 'Dashboard Temps Réel', desc: 'Visualisez votre cashflow instantanément.', icon: BarChart3 },
  { title: 'Mobile First', desc: 'Gérez votre business depuis votre canapé.', icon: Smartphone },
  { title: 'Sécurité Premium', desc: 'Vos données sont chiffrées et protégées.', icon: ShieldCheck },
  { title: 'Exports Comptables', desc: 'Générez des PDF propres pour votre comptable.', icon: Briefcase },
  { title: 'Support Réactif', desc: 'Une équipe à votre écoute 7j/7.', icon: Users }
]

const faqs = [
  { q: "Est-ce vraiment gratuit ?", a: "Oui, pendant toute la phase de test MVP, Recuro est entièrement gratuit et sans aucune limite." },
  { q: "Puis-je arrêter à tout moment ?", a: "Absolument. Vos données vous appartiennent et vous pouvez les exporter en PDF à tout moment." },
  { q: "Mes données sont-elles en sécurité ?", a: "Nous utilisons Supabase pour le stockage sécurisé de vos données avec chiffrement de pointe." }
]
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#FDFDFD] text-[#1A1A1A] overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
    
    <!-- Navigation (Floating) -->
    <nav class="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/70 border-b border-zinc-100 shadow-sm">
      <div class="flex items-center gap-2 md:gap-3 cursor-pointer" @click="router.push('/')">
        <img src="/logo.svg" alt="Recuro Logo" class="h-10 md:h-12 w-auto object-contain" />
      </div>
      <!-- Desktop Links -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
        <a href="#features" class="hover:text-indigo-600 transition-colors">{{ $t('home.nav_product') }}</a>
        <a href="#faq" class="hover:text-indigo-600 transition-colors">{{ $t('home.nav_faq') }}</a>
        <a href="#contact" class="hover:text-indigo-600 transition-colors">{{ $t('home.nav_contact') }}</a>
        <Button variant="ghost" size="sm" @click="router.push('/login')">{{ $t('home.nav_login') }}</Button>
      </div>

      <!-- Main CTA (Visible on Mobile too) -->
      <div class="flex items-center gap-4">
        <Button class="md:hidden" variant="ghost" size="sm" @click="router.push('/login')">{{ $t('home.nav_login_mobile') }}</Button>
        <Button size="sm" @click="router.push('/register')">
          <span class="hidden xs:inline">{{ $t('home.nav_register') }}</span>
          <span class="xs:hidden">{{ $t('home.nav_register_mobile') }}</span>
        </Button>
      </div>
    </nav>

    <!-- 1️⃣ HERO SECTION -->
    <header class="relative pt-32 pb-10 md:pt-48 md:pb-32 container mx-auto px-6 overflow-hidden">
      <div class="text-center max-w-4xl mx-auto space-y-8 relative z-10">
        <h1 class="hero-title text-5xl md:text-8xl font-bold tracking-tight leading-[1.1]">
          {{ $t('home.title') }} <span class="text-indigo-600">{{ $t('home.title_highlight') }}</span>.
        </h1>
        <p class="hero-subtitle text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          {{ $t('home.subtitle') }}
        </p>
        <div class="hero-cta flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" class="px-8 h-14 text-md font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" @click="router.push('/register')">
            {{ $t('home.cta_primary') }}
            <ArrowRight class="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="lg" class="px-8 h-14 text-md font-semibold border-zinc-200 hover:bg-zinc-50" @click="router.push('/login')">
            {{ $t('home.cta_secondary') }}
          </Button>
        </div>
      </div>

      <!-- Dashboard Mockup Overlay -->
      <div class="hero-mockup mt-20 mx-auto max-w-6xl relative">
        <div class="absolute inset-0 bg-indigo-400/20 blur-[120px] rounded-full opacity-20 -z-10"></div>
        <div class="bg-white rounded-2xl border border-zinc-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-2">
          <img 
            :src="dashboardMockup" 
            alt="Dashboard Recuro" 
            class="rounded-xl w-full"
          />
        </div>
      </div>
    </header>

    <!-- 2️⃣ PROBLEME -> SOLUTION -->
    <section class="problem-section py-24 md:py-48 container mx-auto px-6 relative">
      <div class="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-100 -z-10 hidden md:block">
        <div class="scroll-line-inner w-full h-full bg-indigo-600 origin-top"></div>
      </div>

      <div class="grid md:grid-cols-2 gap-12 md:gap-32">
        <div class="space-y-12">
          <h2 class="text-3xl font-bold mb-8 tracking-tight">{{ $t('home.problem_title') }}</h2>
          <div class="problem-item space-y-4">
            <div class="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-4">
              <Clock class="w-6 h-6 text-zinc-400 shrink-0" />
              <p class="text-zinc-600 font-medium leading-relaxed">{{ $t('home.problem_1') }}</p>
            </div>
          </div>
          <div class="problem-item space-y-4">
            <div class="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-4">
              <AlertCircle class="w-6 h-6 text-zinc-400 shrink-0" />
              <p class="text-zinc-600 font-medium leading-relaxed">{{ $t('home.problem_2') }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-12 md:pt-32">
          <h2 class="text-3xl font-bold mb-8 text-indigo-600 tracking-tight">{{ $t('home.solution_title') }}</h2>
          <div class="solution-item space-y-4">
            <div class="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 border-l-4 border-l-indigo-600">
              <CheckCircle class="w-6 h-6 text-indigo-600 shrink-0" />
              <p class="text-indigo-900 font-semibold leading-relaxed">{{ $t('home.solution_1') }}</p>
            </div>
          </div>
          <div class="solution-item space-y-4">
            <div class="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 border-l-4 border-l-indigo-600">
              <CheckCircle class="w-6 h-6 text-indigo-600 shrink-0" />
              <p class="text-indigo-900 font-semibold leading-relaxed">{{ $t('home.solution_2') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3️⃣ LE PROCESSUS RECURO -->
    <section id="process" class="process-section py-24 md:py-32 bg-white relative">
      <div class="container mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest">
             {{ $t('home.process_subtitle') }}
          </div>
          <h2 class="text-4xl md:text-5xl font-bold tracking-tight">{{ $t('home.process_title') }}</h2>
          <p class="text-zinc-500 text-lg leading-relaxed">{{ $t('home.process_desc') }}</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-20">
          <div class="process-card p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:bg-white hover:shadow-2xl transition-all duration-500 text-left group overflow-hidden relative">
            <div class="absolute -top-6 -right-6 text-9xl font-black text-zinc-100 opacity-20 group-hover:text-indigo-100 transition-colors">01</div>
            <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
               <Plus class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4">{{ $t('home.step1_title') }}</h3>
            <p class="text-zinc-500 leading-relaxed">{{ $t('home.step1_desc') }}</p>
          </div>

          <div class="process-card p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:bg-white hover:shadow-2xl transition-all duration-500 text-left group overflow-hidden relative">
            <div class="absolute -top-6 -right-6 text-9xl font-black text-zinc-100 opacity-20 group-hover:text-indigo-100 transition-colors">02</div>
            <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
               <Zap class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4">{{ $t('home.step2_title') }}</h3>
            <p class="text-zinc-500 leading-relaxed">{{ $t('home.step2_desc') }}</p>
          </div>

          <div class="process-card p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:bg-white hover:shadow-2xl transition-all duration-500 text-left group overflow-hidden relative">
            <div class="absolute -top-6 -right-6 text-9xl font-black text-zinc-100 opacity-20 group-hover:text-indigo-100 transition-colors">03</div>
            <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
               <CheckCircle class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4">{{ $t('home.step3_title') }}</h3>
            <p class="text-zinc-500 leading-relaxed">{{ $t('home.step3_desc') }}</p>
          </div>
        </div>

        <!-- Showcase Mockup -->
        <div class="process-mockup max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 bg-white p-2">
          <img 
            :src="dashboardMockup" 
            class="rounded-2xl w-full" 
            alt="Dashboard Recuro interface" 
          />
        </div>
      </div>
    </section>

    <!-- 4️⃣ FONCTIONNALITÉS CLÉS -->
    <section id="features" class="py-24 md:py-32 container mx-auto px-6">
      <div class="grid md:grid-cols-3 gap-12">
        <div v-for="feat in features" :key="feat.title" class="space-y-4 group">
          <div class="w-12 h-12 rounded-lg bg-zinc-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <component :is="feat.icon" class="w-6 h-6 transition-transform group-hover:scale-110" />
          </div>
          <h3 class="text-lg font-bold tracking-tight">{{ feat.title }}</h3>
          <p class="text-sm text-zinc-500 leading-relaxed">{{ feat.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 5️⃣ PERSONAS -->
    <section class="persona-section py-24 md:py-32 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-4xl font-bold tracking-tight">{{ $t('home.personas_title') }}</h2>
          <p class="text-zinc-500">{{ $t('home.personas_desc') }}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="persona-card p-8 rounded-3xl border border-zinc-100 bg-white hover:shadow-2xl transition-shadow duration-300 group">
            <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Smartphone class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-bold mb-3">{{ $t('home.persona1_title') }}</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">{{ $t('home.persona1_desc') }}</p>
          </div>
          <div class="persona-card p-8 rounded-3xl border border-zinc-100 bg-white hover:shadow-2xl transition-shadow duration-300 group">
            <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Zap class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-bold mb-3">{{ $t('home.persona2_title') }}</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">{{ $t('home.persona2_desc') }}</p>
          </div>
          <div class="persona-card p-8 rounded-3xl border border-zinc-100 bg-white hover:shadow-2xl transition-shadow duration-300 group">
            <div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Briefcase class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-bold mb-3">{{ $t('home.persona3_title') }}</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">{{ $t('home.persona3_desc') }}</p>
          </div>
        </div>
      </div>
    </section>



    <!-- 7️⃣ PRICING -->
    <section id="pricing" class="py-32 bg-zinc-950 text-white relative">
      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16 space-y-4">
            <h2 class="text-4xl font-bold tracking-tight">{{ $t('home.pricing_title') }}</h2>
            <p class="text-zinc-400">{{ $t('home.pricing_subtitle') }}</p>
          </div>

          <div class="max-w-2xl mx-auto">
            <div class="p-10 rounded-3xl bg-zinc-900/50 border border-indigo-500/50 hover:bg-zinc-900 transition-colors flex flex-col text-center">
              <h3 class="text-2xl font-bold mb-2">{{ $t('home.pricing_card_title') }}</h3>
              <p class="text-zinc-400 mb-8">{{ $t('home.pricing_card_desc') }}</p>
              <div class="text-6xl font-black mb-8 tracking-tighter text-indigo-400">0$ / 0€ <span class="text-sm font-normal text-zinc-600 tracking-normal">{{ $t('home.pricing_forever') }}</span></div>
              <ul class="grid grid-cols-2 gap-4 mb-12 text-left text-sm text-zinc-300">
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Clients illimités</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Factures illimitées</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Relances manuelles</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Exports PDF</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Support Direct</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Facturation internationale</li>
              </ul>
              <Button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 text-lg font-bold" @click="router.push('/register')">{{ $t('home.cta_primary') }}</Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 9️⃣ FAQ -->
    <section id="faq" class="py-32 container mx-auto px-6 max-w-4xl">
      <div class="text-center mb-16 space-y-4">
        <h2 class="text-3xl font-bold tracking-tight">On répond à tout.</h2>
        <p class="text-zinc-500 font-medium">Encore un doute ? On est là.</p>
      </div>
      <div class="space-y-2">
        <details v-for="faq in faqs" :key="faq.q" class="group bg-white rounded-2xl border border-zinc-100 overflow-hidden transition-all hover:border-indigo-100">
          <summary class="p-6 cursor-pointer flex justify-between items-center font-bold text-zinc-800 list-none">
            {{ faq.q }}
            <div class="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-open:rotate-180 transition-transform">
               <ChevronDown class="w-4 h-4" />
            </div>
          </summary>
          <div class="px-6 pb-6 text-zinc-500 text-sm leading-relaxed">
            {{ faq.a }}
          </div>
        </details>
      </div>
    </section>

    <!-- 🔟 FINAL CTA -->
    <section class="py-32 mb-20">
      <div class="container mx-auto px-6">
        <div class="bg-indigo-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative z-10 space-y-10">
            <h2 class="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Libérez-vous de la facturation.
            </h2>
            <p class="text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
              Il y a deux types de freelances : ceux qui luttent avec leurs factures, et ceux qui utilisent Recuro.
            </p>
            <div class="pt-6">
              <Button size="lg" class="px-12 h-20 bg-white !text-black hover:bg-indigo-50 text-xl font-bold rounded-2xl shadow-2xl transition-transform hover:scale-105" @click="router.push('/register')">
                Rejoindre les 500+ membres
              </Button>
            </div>
            <p class="text-sm text-indigo-200/60 font-medium">Inscription en 2 minutes • Pas de carte bancaire</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 10.5️⃣ CONTACT SECTION -->
    <section id="contact" class="py-24 bg-zinc-50 border-t border-zinc-100">
      <div class="container mx-auto px-6 max-w-5xl">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div class="space-y-8">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest">
               {{ $t('home.contact_badge') }}
            </div>
            <h2 class="text-4xl md:text-5xl font-bold tracking-tight">{{ $t('home.contact_title') }}</h2>
            <p class="text-zinc-500 text-lg leading-relaxed">
              {{ $t('home.contact_desc') }}
            </p>
            <div class="space-y-6 pt-4">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-zinc-800">{{ $t('home.contact_email_title') }}</h4>
                  <p class="text-zinc-500 text-sm mt-1">{{ $t('home.contact_email_desc') }}</p>
                  <a href="mailto:oliviermevaa0@gmail.com" class="text-indigo-600 font-medium hover:underline block mt-1">oliviermevaa0@gmail.com</a>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-zinc-800">{{ $t('home.contact_office_title') }}</h4>
                  <p class="text-zinc-500 text-sm mt-1">{{ $t('home.contact_office_desc') }}</p>
                  <address class="not-italic text-zinc-600 mt-1 font-medium">Derrière Socaver Ndogbong<br/>Douala, Cameroun</address>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white p-8 md:p-10 rounded-3xl border border-zinc-100 shadow-xl relative">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full"></div>
            <h3 class="text-2xl font-bold mb-6">{{ $t('home.contact_form_title') }}</h3>
            <form @submit.prevent="handleContactSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-1">{{ $t('home.contact_form_name') }}</label>
                <input 
                  v-model="contactName"
                  type="text" 
                  class="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                  :placeholder="$t('home.contact_form_name')"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-1">{{ $t('home.contact_form_email') }}</label>
                <input 
                  v-model="contactEmail"
                  type="email" 
                  class="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                  placeholder="hello@example.com"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-1">{{ $t('home.contact_form_message') }}</label>
                <textarea 
                  v-model="contactMessage"
                  rows="4" 
                  class="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none" 
                  :placeholder="$t('home.contact_form_message')"
                  required
                ></textarea>
              </div>
              
              <div v-if="submitStatus === 'success'" class="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <CheckCircle class="w-4 h-4" />
                Message envoyé avec succès !
              </div>
              
              <div v-if="submitStatus === 'error'" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle class="w-4 h-4" />
                {{ errorMessage }}
              </div>

              <Button 
                type="submit" 
                class="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-medium flex items-center justify-center gap-2"
                :disabled="isSubmitting"
              >
                <template v-if="isSubmitting">
                  <Loader2 class="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </template>
                <template v-else>
                  <Send class="w-4 h-4" />
                  {{ $t('home.contact_form_submit') }}
                </template>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- 11️⃣ FOOTER -->
    <footer class="pt-20 pb-12 border-t border-zinc-100 bg-white">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div class="space-y-6 md:col-span-1">
            <div class="flex items-center gap-3">
              <img src="/logo.svg" alt="Recuro Logo" class="h-10 w-auto object-contain" />
            </div>
            <p class="text-zinc-500 text-sm leading-relaxed">
              {{ $t('home.footer_desc') }}
            </p>
          </div>
          
          <div>
            <h4 class="font-bold mb-6 text-zinc-800">{{ $t('home.nav_product') }}</h4>
            <ul class="space-y-4 text-sm text-zinc-500">
              <li><a href="#features" class="hover:text-indigo-600 transition-colors">Fonctionnalités</a></li>
              <li><a href="#process" class="hover:text-indigo-600 transition-colors">Fonctionnement</a></li>
              <li><a href="#pricing" class="hover:text-indigo-600 transition-colors">{{ $t('home.nav_pricing') }}</a></li>
              <li><a href="#faq" class="hover:text-indigo-600 transition-colors">{{ $t('home.nav_faq') }}</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-6 text-zinc-800">{{ $t('home.footer_legal') }}</h4>
            <ul class="space-y-4 text-sm text-zinc-500">
              <li><a href="#" class="hover:text-indigo-600 transition-colors">{{ $t('home.footer_terms') }}</a></li>
              <li><a href="#" class="hover:text-indigo-600 transition-colors">{{ $t('home.footer_privacy') }}</a></li>
              <li><a href="#" class="hover:text-indigo-600 transition-colors">{{ $t('home.footer_mentions') }}</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-6 text-zinc-800">{{ $t('home.nav_contact') }}</h4>
            <ul class="space-y-4 text-sm text-zinc-500">
              <li class="flex items-start gap-3">
                <span class="font-medium text-zinc-700">Email:</span>
                <a href="mailto:holiviermevaa@gmail.com" class="hover:text-indigo-600 transition-colors">oliviermevaa0@gmail.com</a>
              </li>
              <li class="flex items-start gap-3">
                <span class="font-medium text-zinc-700">Bureaux:</span>
                <span>Douala Cameroun<br/>Ndogbon Socaver</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-zinc-400 text-sm">© 2026 Recuro Technologies Inc. {{ $t('home.footer_rights') }}</p>
          <div class="flex gap-4">
            <a href="#" class="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
               <span class="sr-only">Twitter</span>
               <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
            </a>
            <a href="#" class="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
               <span class="sr-only">GitHub</span>
               <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<style>
/* Base Styles */
html {
  scroll-behavior: smooth;
}

/* Hide detail markers */
details summary::-webkit-details-marker {
  display:none;
}

/* Selection color */
::selection {
  background-color: #EEF2FF;
  color: #4F46E5;
}
</style>
