/* File: user/themes/lorenzodm/js/theme.js */

/**
 * Script principale del tema LorenzoDM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inizializzazione del tema
    console.log('Inizializzazione tema lorenzodm.it');
    
    // Gestione tema chiaro/scuro
    const toggleSwitch = document.querySelector('#checkbox');
    
    // Verifica presenza elementi
    if (toggleSwitch) {
        // Imposta il tema iniziale
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Applica il tema all'avvio
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Imposta lo stato del checkbox in base al tema
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
        
        // Event listener per il cambio tema
        toggleSwitch.addEventListener('change', function(e) {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }
    
    // ---------- CARICAMENTO LAZY DELLE IMMAGINI ----------
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages && lazyImages.length > 0) {
        lazyImages.forEach(img => {
            const newImg = new Image();
            newImg.src = img.getAttribute('data-src');
            newImg.onload = () => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                img.classList.add('loaded');
            };
        });
    }

    // ---------- ANIMAZIONI AL CARICAMENTO ----------
    const animateSections = document.querySelectorAll('.fade-in');
    if (animateSections && animateSections.length > 0) {
        // Usa Intersection Observer API per animazioni al scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Osserva tutte le sezioni
        animateSections.forEach(section => {
            observer.observe(section);
        });
    }

    // ---------- CORREZIONE URL YOUTUBE ----------
    const videoFrames = document.querySelectorAll('.video-wrapper iframe');
    if (videoFrames && videoFrames.length > 0) {
        videoFrames.forEach(frame => {
            if (frame.src.includes('watch?v=')) {
                frame.src = frame.src.replace('watch?v=', 'embed/');
            }
        });
    }
    
    // ---------- SMOOTH SCROLLING ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ---------- PREVENIRE SPAZI BIANCHI ----------
    // Aggiunge classi per prevenire spazi bianchi
    const bannerContainer = document.querySelector('.banner-container');
    if (bannerContainer) {
        bannerContainer.style.margin = '0';
        bannerContainer.style.padding = '0';
        bannerContainer.style.lineHeight = '0';
        bannerContainer.style.fontSize = '0';
    }
    
    const bannerImage = document.querySelector('.banner-image');
    if (bannerImage) {
        bannerImage.style.margin = '0';
        bannerImage.style.padding = '0';
        bannerImage.style.display = 'block';
        bannerImage.style.width = '100%';
    }
});