import gsap from 'gsap'

export function useHeroAnimation() {
    const initHeroAnimations = () => {
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        heroTl.from('.hero-title', {
            y: 100,
            opacity: 0,
            duration: 1.2
        })
            .from('.hero-subtitle', {
                y: 30,
                opacity: 0,
                duration: 0.8
            }, '-=0.8')
            .from('.hero-cta', {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.2
            }, '-=0.4')
            .from('.hero-mockup', {
                y: 100,
                opacity: 0,
                duration: 1,
                scale: 0.95
            }, '-=0.4')

        // Dashboard floating animation
        gsap.to('.hero-mockup', {
            y: '+=15',
            rotation: 1,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        })
    }

    return {
        initHeroAnimations
    }
}
