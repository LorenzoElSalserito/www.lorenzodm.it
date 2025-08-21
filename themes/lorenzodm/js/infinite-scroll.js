/**
 * Infinite Scroll per lorenzodm.it
 * 
 * Questo script implementa il caricamento infinito degli articoli nella pagina del blog
 * quando l'utente scorre verso il fondo della pagina.
 * 
 * @author: lorenzodm.it
 * @version: 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementi principali - supporta sia articoli che progetti
    const articlesContainer = document.querySelector('.articles-grid') || document.querySelector('.projects-grid');
    const loadingIndicator = document.createElement('div');
    
    // Variabili di stato
    let currentPage = 1;
    let isLoading = false;
    let hasMoreContent = true;
    let baseUrl = window.location.pathname;
    
    // Configura l'indicatore di caricamento
    loadingIndicator.className = 'text-center my-4 loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento...</span></div><p class="mt-2">Caricamento contenuti...</p>';
    loadingIndicator.style.display = 'none';
    
    // Aggiungi l'indicatore dopo il container degli articoli
    if (articlesContainer) {
        articlesContainer.parentNode.insertBefore(loadingIndicator, articlesContainer.nextSibling);
        
        // Controlla se abbiamo la paginazione (per retrocompatibilità)
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            pagination.style.display = 'none'; // Nascondi la paginazione tradizionale
        }
        
        // Inizializza l'observer per l'infinite scroll
        initInfiniteScroll();
    }
    
    /**
     * Inizializza l'Intersection Observer per rilevare quando l'utente
     * scorre fino alla fine della lista degli articoli
     */
    function initInfiniteScroll() {
        // Verifica se il browser supporta IntersectionObserver
        if ('IntersectionObserver' in window) {
            const options = {
                rootMargin: '0px 0px 200px 0px', // Carica nuovo contenuto 200px prima di raggiungere il fondo
                threshold: 0.1
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && hasMoreContent && !isLoading) {
                        loadMoreArticles();
                    }
                });
            }, options);
            
            // Osserva l'ultimo articolo nel container
            const lastArticle = articlesContainer.querySelector('article:last-child');
            if (lastArticle) {
                observer.observe(lastArticle);
            }
            
            // Memorizza l'observer per poterlo aggiornare quando si caricano nuovi articoli
            window.articleObserver = observer;
        } else {
            // Fallback per browser che non supportano IntersectionObserver
            window.addEventListener('scroll', function() {
                const scrollHeight = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );
                
                const scrollPosition = window.innerHeight + window.pageYOffset;
                
                // Carica più articoli quando siamo vicini al fondo della pagina
                if (scrollPosition > scrollHeight - 800 && hasMoreContent && !isLoading) {
                    loadMoreArticles();
                }
            });
        }
    }
    
    /**
     * Carica più articoli tramite AJAX
     */
    function loadMoreArticles() {
        isLoading = true;
        currentPage++;
        
        // Mostra l'indicatore di caricamento
        loadingIndicator.style.display = 'block';
        
        // Prepara l'URL per la richiesta AJAX
        let ajaxUrl = baseUrl;
        if (ajaxUrl.indexOf('?') > -1) {
            ajaxUrl += '&page=' + currentPage;
        } else {
            ajaxUrl += ajaxUrl.endsWith('/') ? '' : '/';
            ajaxUrl += 'page:' + currentPage;
        }
        
        // Aggiungi parametro AJAX per indicare che è una richiesta di caricamento infinito
        ajaxUrl += ajaxUrl.indexOf('?') > -1 ? '&ajax=1' : '?ajax=1';
        
        // Effettua la richiesta AJAX
        fetch(ajaxUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Errore nella richiesta di caricamento: ' + response.statusText);
                }
                return response.text();
            })
            .then(html => {
                // Analizza il contenuto HTML ricevuto
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Cerca i nuovi articoli - supporta sia .articles-grid che .projects-grid
                const newArticles = doc.querySelectorAll('.articles-grid article, .projects-grid article');
                
                // Se non ci sono nuovi articoli, non abbiamo più contenuti da caricare
                if (newArticles.length === 0) {
                    hasMoreContent = false;
                    loadingIndicator.innerHTML = '<p class="text-muted">Hai raggiunto la fine dei contenuti disponibili.</p>';
                    return;
                }
                
                // Aggiungi i nuovi articoli al container
                newArticles.forEach(article => {
                    articlesContainer.appendChild(article.cloneNode(true));
                });
                
                // Aggiorna l'observer per osservare il nuovo ultimo articolo
                if (window.articleObserver) {
                    const lastArticle = articlesContainer.querySelector('article:last-child');
                    if (lastArticle) {
                        window.articleObserver.observe(lastArticle);
                    }
                }
                
                // Inizializza eventuali funzionalità sugli articoli appena caricati
                initNewArticlesFeatures();
            })
            .catch(error => {
                console.error('Errore durante il caricamento dei contenuti:', error);
                loadingIndicator.innerHTML = '<p class="text-danger">Si è verificato un errore durante il caricamento. <button class="btn btn-sm btn-primary ms-2" id="retry-load">Riprova</button></p>';
                
                // Aggiungi evento per riprovare
                const retryButton = document.getElementById('retry-load');
                if (retryButton) {
                    retryButton.addEventListener('click', function() {
                        currentPage--; // Riprova la stessa pagina
                        loadMoreArticles();
                    });
                }
            })
            .finally(() => {
                isLoading = false;
                
                // Nascondi l'indicatore di caricamento se non ci sono più articoli
                if (!hasMoreContent) {
                    setTimeout(() => {
                        loadingIndicator.style.display = 'none';
                    }, 3000);
                } else {
                    loadingIndicator.style.display = 'none';
                }
            });
    }
    
    /**
     * Inizializza funzionalità specifiche sugli articoli appena caricati
     */
    function initNewArticlesFeatures() {
        // Animazioni fade-in
        const newArticles = articlesContainer.querySelectorAll('article:not(.visible)');
        newArticles.forEach(article => {
            article.classList.add('visible');
        });
        
        // Lazy loading per le immagini
        const lazyImages = articlesContainer.querySelectorAll('img[data-src]:not(.loaded)');
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
    }
});
