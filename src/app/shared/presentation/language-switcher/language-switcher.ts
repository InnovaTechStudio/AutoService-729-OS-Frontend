import { Component } from '@angular/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonToggle, MatButtonToggleGroup],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  /** Currently selected language code in the toggle group. */
  currentLang = 'en';
  /** Supported language codes available to users. */
  languages = ['en', 'es'];

  /**
   * @param translate - Translation service managing runtime locale state.
   */
  constructor(private translate: TranslateService) {
    this.currentLang = translate.getCurrentLang();
  }

  /**
   * Changes the active application language.
   *
   * @param language - Locale code to activate.
   */
  useLanguage(language: string) {
    this.translate.use(language);
  }
}
