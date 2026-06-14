import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  options = [
    { label: 'ES', value: 'es', flag: '🇪🇸' },
    { label: 'EN', value: 'en', flag: '🇺🇸' },
  ];

  constructor(public translate: TranslateService) {}

  switchLocale(value: string) {
    this.translate.use(value);
    localStorage.setItem('autoservice-locale', value);
  }
}
