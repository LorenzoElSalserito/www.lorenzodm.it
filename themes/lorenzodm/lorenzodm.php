<?php
namespace Grav\Theme;

use Grav\Common\Theme;

class LorenzoDM extends Theme
{
    /**
     * Inizializza il tema
     */
    public static function getSubscribedEvents()
    {
        return [
            'onThemeInitialized' => ['onThemeInitialized', 0],
            'onTwigSiteVariables' => ['onTwigSiteVariables', 0],
            'onTwigLoader' => ['onTwigLoader', 0],
            'onAssetsInitialized' => ['onAssetsInitialized', 0]
        ];
    }
    
    /**
     * Inizializzazione del tema
     */
    public function onThemeInitialized()
    {
        // Imposta il tema come attivo
        if ($this->isAdmin()) {
            $this->enable([
                'onAdminSave' => ['onAdminSave', 0]
            ]);
        }
    }

    /**
     * Carica i percorsi Twig personalizzati
     */
    public function onTwigLoader()
    {
        $this->grav['twig']->addPath(__DIR__ . '/templates', 'theme');
    }
    
    /**
     * Inizializza gli asset del tema
     */
    public function onAssetsInitialized()
    {
        // Rimuovi eventuali asset conflittuali
        $this->grav['assets']->resetCss();
    }
    
    /**
     * Aggiunge le variabili CSS e JS
     */
    public function onTwigSiteVariables()
    {
        // Aggiunge CSS per rimuovere la banda bianca (priorità massima)
        $this->grav['assets']->addInlineCss('
            html, body { margin: 0 !important; padding: 0 !important; width: 100%; overflow-x: hidden; }
            body { padding-top: 56px !important; }
            .banner-container { margin: 0 !important; padding: 0 !important; line-height: 0 !important; font-size: 0 !important; display: block !important; overflow: hidden !important; }
            .banner-image { margin: 0 !important; padding: 0 !important; display: block !important; width: 100% !important; }
            .navbar { position: fixed !important; top: 0 !important; width: 100% !important; z-index: 1000 !important; }
        ', ['priority' => 100]);
        
        // Aggiunge CSS principale del tema
        $this->grav['assets']->addCss('theme://css/custom.css', ['priority' => 90]);

        // Aggiunge CSS per il cookie popup
        $this->grav['assets']->addCss('theme://css/cookie-popup.css', 90);

        // Aggiunge JavaScript per il cookie popup  
        $this->grav['assets']->addJs('theme://js/cookie-popup.js', ['group' => 'bottom']);
        
        // Aggiunge CSS per fix spazi bianchi
        $this->grav['assets']->addCss('theme://css/fix-whitespace.css', ['priority' => 95]);
        
        // Aggiunge CSS esterni via CDN
        $this->grav['assets']->addCss('https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css', ['priority' => 85]);
        $this->grav['assets']->addCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', ['priority' => 80]);
        
        // Aggiunge CSS del plugin
        if ($this->config->get('plugins.markdown-notices.enabled')) {
            $this->grav['assets']->addCss('plugin://markdown-notices/assets/notices.css');
        }
        
        if ($this->config->get('plugins.form.enabled')) {
            $this->grav['assets']->addCss('plugin://form/assets/form-styles.css');
        }
        
        if ($this->config->get('plugins.login.enabled')) {
            $this->grav['assets']->addCss('plugin://login/css/login.css');
        }
        
        // Aggiunge JavaScript esterni via CDN
        $this->grav['assets']->addJs('https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js', ['group' => 'bottom', 'priority' => 90]);
        
        // Aggiunge JavaScript principale del tema
        $this->grav['assets']->addJs('theme://js/theme.js', ['group' => 'bottom', 'priority' => 95]);
        
        // Aggiunge variabili di configurazione al modello Twig
        $this->grav['twig']->twig_vars['theme_config'] = $this->config->get('themes.' . $this->name);

        // Aggiunge CSS per l'infinite scroll
        $this->grav['assets']->addCss('theme://css/infinite-scroll.css', 50);

        // Aggiunge JavaScript per l'infinite scroll (solo per le pagine non AJAX)
        if (!$this->isAjaxRequest()) {
            $this->grav['assets']->addJs('theme://js/infinite-scroll.js', ['group' => 'bottom']);
        }
        
    }
    
    /**
     * Verifica se siamo nell'amministrazione
     * 
     * @return bool
     */
    public function isAdmin()
    {
        return $this->grav['config']->get('plugins.admin.enabled') && 
               $this->grav['uri']->path() == $this->grav['config']->get('plugins.admin.route');
    }
    
    /**
     * Verifica se è una richiesta AJAX
     */
    private function isAjaxRequest()
    {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest' ||
            isset($_GET['ajax']) && $_GET['ajax'] == 1;
    }
}