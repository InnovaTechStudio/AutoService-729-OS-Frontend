/**
 * AppTranslateService
 * 
 * Servicio central de internacionalización (i18n) de la aplicación.
 * 
 * Funcionalidades:
 * - Idioma por defecto: Inglés ('en')
 * - Persistencia de la preferencia del usuario en localStorage
 * - Detección automática del idioma del navegador
 * - Soporte para cambio dinámico entre Inglés y Español
 * - Métodos seguros y con fallback
 * 
 * @service
 * @providedIn 'root'
 */
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class AppTranslateService {

    private translate = inject(TranslateService);
    private readonly STORAGE_KEY = 'preferredLanguage';
    private readonly SUPPORTED_LANGUAGES: ('en' | 'es')[] = ['en', 'es'];

    constructor() {
        this.initLanguage();
    }

    /**
     * Inicializa el idioma de la aplicación con la siguiente prioridad:
     * 1. Idioma guardado por el usuario
     * 2. Idioma del navegador
     * 3. Inglés por defecto
     */
    private initLanguage(): void {
        const savedLang = localStorage.getItem(this.STORAGE_KEY);
        const browserLang = this.translate.getBrowserLang();

        let initialLang: 'en' | 'es' = 'en';

        if (savedLang && this.SUPPORTED_LANGUAGES.includes(savedLang as 'en' | 'es')) {
            initialLang = savedLang as 'en' | 'es';
        }
        else if (browserLang === 'es') {
            initialLang = 'es';
        }

        this.translate.setDefaultLang('en');
        this.translate.use(initialLang);
    }

    /**
     * Cambia el idioma de la aplicación y guarda la preferencia del usuario.
     * @param lang - 'en' para inglés o 'es' para español
     */
    switchLanguage(lang: 'en' | 'es'): void {
        if (this.SUPPORTED_LANGUAGES.includes(lang)) {
            this.translate.use(lang);
            localStorage.setItem(this.STORAGE_KEY, lang);
        }
    }

    /**
     * Retorna el idioma actual de la aplicación.
     */
    getCurrentLang(): string {
        return this.translate.currentLang || 'en';
    }

    /**
     * Retorna la lista de idiomas soportados por la aplicación.
     */
    getSupportedLanguages(): readonly ('en' | 'es')[] {
        return this.SUPPORTED_LANGUAGES;
    }

    /**
     * Verifica si el idioma actual es español.
     */
    isSpanish(): boolean {
        return this.getCurrentLang() === 'es';
    }

    /**
     * Verifica si el idioma actual es inglés.
     */
    isEnglish(): boolean {
        return this.getCurrentLang() === 'en';
    }
}