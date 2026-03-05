<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  Plus
} from 'lucide-vue-next'

import { useHeroAnimation } from '@/composables/useHeroAnimation'
import dashboardMockup from '@/assets/images/dashboard-mockup.png'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()
const { initHeroAnimations } = useHeroAnimation()

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
    <nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/50 border-b border-zinc-100">
      <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">R</div>
        Recuro
      </div>
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
        <a href="#features" class="hover:text-indigo-600 transition-colors">Produit</a>
        <a href="#faq" class="hover:text-indigo-600 transition-colors">FAQ</a>
        <Button variant="ghost" size="sm" @click="router.push('/login')">Se connecter</Button>
        <Button size="sm" @click="router.push('/register')">Essayer l'MVP</Button>
      </div>
      </div>
    </nav>

    <!-- 1️⃣ HERO SECTION -->
    <header class="relative pt-32 pb-20 md:pt-48 md:pb-32 container mx-auto px-6 overflow-hidden">
      <div class="text-center max-w-4xl mx-auto space-y-8 relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
          <Zap class="w-3 h-3" />
          Nouveauté : Les relances intelligentes sont là
        </div>
        <h1 class="hero-title text-5xl md:text-8xl font-bold tracking-tight leading-[1.1]">
          Facturez avec <span class="text-indigo-600">élégance</span>.
        </h1>
        <p class="hero-subtitle text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          La solution de facturation lofi pour les freelances et studios créatifs qui exigent la simplicité sans compromis sur la puissance.
        </p>
        <div class="hero-cta flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" class="px-8 h-14 text-md font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" @click="router.push('/register')">
            Rejoindre la phase de test
            <ArrowRight class="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="lg" class="px-8 h-14 text-md font-semibold border-zinc-200 hover:bg-zinc-50" @click="router.push('/login')">
            Accéder à mon compte
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
          <h2 class="text-3xl font-bold mb-8 tracking-tight">Arrêtez de lutter.</h2>
          <div class="problem-item space-y-4">
            <div class="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-4">
              <Clock class="w-6 h-6 text-zinc-400 shrink-0" />
              <p class="text-zinc-600 font-medium leading-relaxed">Perte de 4h par semaine sur Excel et Word juste pour la gestion administrative.</p>
            </div>
          </div>
          <div class="problem-item space-y-4">
            <div class="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-4">
              <AlertCircle class="w-6 h-6 text-zinc-400 shrink-0" />
              <p class="text-zinc-600 font-medium leading-relaxed">Des impayés qui traînent car vous oubliez de relancer vos clients par gêne ou manque de temps.</p>
            </div>
          </div>
        </div>

        <div class="space-y-12 md:pt-32">
          <h2 class="text-3xl font-bold mb-8 text-indigo-600 tracking-tight">Choisissez la fluidité.</h2>
          <div class="solution-item space-y-4">
            <div class="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 border-l-4 border-l-indigo-600">
              <CheckCircle class="w-6 h-6 text-indigo-600 shrink-0" />
              <p class="text-indigo-900 font-semibold leading-relaxed">Facturation instantanée en 3 clics avec templates personnalisés.</p>
            </div>
          </div>
          <div class="solution-item space-y-4">
            <div class="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 border-l-4 border-l-indigo-600">
              <CheckCircle class="w-6 h-6 text-indigo-600 shrink-0" />
              <p class="text-indigo-900 font-semibold leading-relaxed">Relances automatiques élégantes et paiements en ligne intégrés.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3️⃣ LE PROCESSUS RECURO (Consolidated & Highly Visible) -->
    <section id="process" class="process-section py-24 md:py-32 bg-white relative">
      <div class="container mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest">
             Simple & Efficace
          </div>
          <h2 class="text-4xl md:text-5xl font-bold tracking-tight">3 étapes. Zéro stress.</h2>
          <p class="text-zinc-500 text-lg leading-relaxed">De la prise de contact au virement bancaire, Recuro automatise tout votre flux de facturation.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-20">
          <div class="process-card p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:bg-white hover:shadow-2xl transition-all duration-500 text-left group overflow-hidden relative">
            <div class="absolute -top-6 -right-6 text-9xl font-black text-zinc-100 opacity-20 group-hover:text-indigo-100 transition-colors">01</div>
            <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
               <Plus class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4">Créez le projet</h3>
            <p class="text-zinc-500 leading-relaxed">Importez vos clients et définissez vos prestations. En 2 minutes, vous êtes prêt à émettre votre première facture certifiée.</p>
          </div>

          <div class="process-card p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:bg-white hover:shadow-2xl transition-all duration-500 text-left group overflow-hidden relative">
            <div class="absolute -top-6 -right-6 text-9xl font-black text-zinc-100 opacity-20 group-hover:text-indigo-100 transition-colors">02</div>
            <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
               <Zap class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4">Générez le lien</h3>
            <p class="text-zinc-500 leading-relaxed">Envoyez vos factures par Email, WhatsApp ou SMS en un clic. Simple, rapide et professionnel.</p>
          </div>

          <div class="process-card p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:bg-white hover:shadow-2xl transition-all duration-500 text-left group overflow-hidden relative">
            <div class="absolute -top-6 -right-6 text-9xl font-black text-zinc-100 opacity-20 group-hover:text-indigo-100 transition-colors">03</div>
            <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
               <CheckCircle class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4">Suivez vos revenus</h3>
            <p class="text-zinc-500 leading-relaxed">Recuro vous permet de garder un oeil sur vos factures payées et en attente. Ne perdez plus jamais le fil de votre trésorerie.</p>
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
          <h2 class="text-4xl font-bold tracking-tight">Conçu pour votre métier.</h2>
          <p class="text-zinc-500">Recuro est l'allié des profils qui ont de l'ambition.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="persona-card p-8 rounded-3xl border border-zinc-100 bg-white hover:shadow-2xl transition-shadow duration-300 group">
            <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Smartphone class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-bold mb-3">Freelances Créatifs</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">Artistes, photographes et designers qui détestent les chiffres mais adorent être payés à temps.</p>
          </div>
          <div class="persona-card p-8 rounded-3xl border border-zinc-100 bg-white hover:shadow-2xl transition-shadow duration-300 group">
            <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Zap class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-bold mb-3">Développeurs Indés</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">Ingénieurs et SaaS makers qui ont besoin de rigueur et d'une automatisation totale.</p>
          </div>
          <div class="persona-card p-8 rounded-3xl border border-zinc-100 bg-white hover:shadow-2xl transition-shadow duration-300 group">
            <div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Briefcase class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-bold mb-3">Studios & Agences</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">Petites structures qui exigent un outil pro pour rassurer leurs grands comptes.</p>
          </div>
        </div>
      </div>
    </section>



    <!-- 7️⃣ PRICING -->
    <section id="pricing" class="py-32 bg-zinc-950 text-white relative">
      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16 space-y-4">
            <h2 class="text-4xl font-bold tracking-tight">Pas de mensonge, pas de surprises.</h2>
            <p class="text-zinc-400">Le modèle SaaS le plus honnête du marché.</p>
          </div>

          <div class="max-w-2xl mx-auto">
            <div class="p-10 rounded-3xl bg-zinc-900/50 border border-indigo-500/50 hover:bg-zinc-900 transition-colors flex flex-col text-center">
              <h3 class="text-2xl font-bold mb-2">Phase MVP - 100% Gratuit</h3>
              <p class="text-zinc-400 mb-8">Nous collectons vos retours pour améliorer Recuro.</p>
              <div class="text-6xl font-black mb-8 tracking-tighter text-indigo-400">0€ <span class="text-sm font-normal text-zinc-600 tracking-normal">pour toujours sur l'accès test</span></div>
              <ul class="grid grid-cols-2 gap-4 mb-12 text-left text-sm text-zinc-300">
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Clients illimités</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Factures illimitées</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Relances manuelles</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Exports PDF</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Support Direct</li>
                <li class="flex items-center gap-3"><CheckCircle class="w-4 h-4 text-indigo-400" /> Accès anticipé</li>
              </ul>
              <Button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 text-lg font-bold" @click="router.push('/register')">Démarrer maintenant</Button>
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

    <!-- 11️⃣ FOOTER -->
    <footer class="py-12 border-t border-zinc-100 bg-white">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-12">
          <div class="flex items-center gap-2 font-bold text-2xl tracking-tighter">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">R</div>
            Recuro
          </div>
          <div class="flex flex-wrap justify-center gap-12 text-sm font-semibold text-zinc-400">
             <a href="#" class="hover:text-indigo-600">Produit</a>
             <a href="#" class="hover:text-indigo-600">Tarifs</a>
             <a href="#" class="hover:text-indigo-600">Blog</a>
             <a href="#" class="hover:text-indigo-600">Mentions Légales</a>
          </div>
          <p class="text-zinc-300 text-xs">© 2026 Recuro Technologies Inc.</p>
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
