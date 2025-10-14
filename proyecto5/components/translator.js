const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

class Translator {

  translate(text, locale) {
    if (!text) {
      return { error: 'No text to translate' };
    }

    if (!locale || (locale !== 'american-to-british' && locale !== 'british-to-american')) {
      return { error: 'Invalid value for locale field' };
    }

    let translation = text;
    let hasTranslation = false;

    if (locale === 'american-to-british') {
      const result = this.translateToBritish(text);
      translation = result.text;
      hasTranslation = result.hasTranslation;
    } else if (locale === 'british-to-american') {
      const result = this.translateToAmerican(text);
      translation = result.text;
      hasTranslation = result.hasTranslation;
    }

    if (!hasTranslation) {
      return { text, translation: "Everything looks good to me!" };
    }

    return { text, translation };
  }

  translateToBritish(text) {
    let translatedText = text;
    let hasTranslation = false;

    // Handle time format (e.g., 10:30 -> 10.30)
    const timeRegex = /(\d{1,2}):(\d{2})(?!\d)/g;
    if (timeRegex.test(translatedText)) {
      translatedText = translatedText.replace(timeRegex, '<span class="highlight">$1.$2</span>');
      hasTranslation = true;
    }

    // Handle American-only terms first (broader matches)
    for (const [american, british] of Object.entries(americanOnly)) {
      const termRegex = new RegExp(`\\b${this.escapeRegExp(american)}\\b`, 'gi');
      if (termRegex.test(translatedText)) {
        translatedText = translatedText.replace(termRegex, `<span class="highlight">${british}</span>`);
        hasTranslation = true;
      }
    }

    // Handle spelling differences
    for (const [american, british] of Object.entries(americanToBritishSpelling)) {
      const wordRegex = new RegExp(`\\b${this.escapeRegExp(american)}\\b`, 'gi');
      if (wordRegex.test(translatedText)) {
        translatedText = translatedText.replace(wordRegex, `<span class="highlight">${british}</span>`);
        hasTranslation = true;
      }
    }

    // Handle titles (e.g., Mr. -> Mr) - do this first before other translations
    for (const [american, british] of Object.entries(americanToBritishTitles)) {
      // Use a more specific pattern for titles - match with optional space after
      const titleRegex = new RegExp(`\\b${this.escapeRegExp(american)}(?=\\s|\\.|$)`, 'gi');
      if (titleRegex.test(translatedText)) {
        translatedText = translatedText.replace(titleRegex, (match) => {
          // Preserve the original case of the first letter
          const capitalizedBritish = british.charAt(0).toUpperCase() + british.slice(1);
          return `<span class="highlight">${capitalizedBritish}</span>`;
        });
        hasTranslation = true;
      }
    }

    return { text: translatedText, hasTranslation };
  }

  translateToAmerican(text) {
    let translatedText = text;
    let hasTranslation = false;

    // Handle time format (e.g., 10.30 -> 10:30)
    const timeRegex = /(\d{1,2})\.(\d{2})(?!\d)/g;
    if (timeRegex.test(translatedText)) {
      translatedText = translatedText.replace(timeRegex, '<span class="highlight">$1:$2</span>');
      hasTranslation = true;
    }

    // Handle British-only terms first (broader matches)
    for (const [british, american] of Object.entries(britishOnly)) {
      const termRegex = new RegExp(`\\b${this.escapeRegExp(british)}\\b`, 'gi');
      if (termRegex.test(translatedText)) {
        translatedText = translatedText.replace(termRegex, `<span class="highlight">${american}</span>`);
        hasTranslation = true;
      }
    }

    // Handle spelling differences (reverse lookup)
    for (const [american, british] of Object.entries(americanToBritishSpelling)) {
      const wordRegex = new RegExp(`\\b${this.escapeRegExp(british)}\\b`, 'gi');
      if (wordRegex.test(translatedText)) {
        translatedText = translatedText.replace(wordRegex, `<span class="highlight">${american}</span>`);
        hasTranslation = true;
      }
    }

    // Handle titles (e.g., Mr -> Mr.) - do this first before other translations
    for (const [american, british] of Object.entries(americanToBritishTitles)) {
      // Use a more specific pattern for titles - match with optional space after
      const titleRegex = new RegExp(`\\b${this.escapeRegExp(british)}(?=\\s|\\.|$)`, 'gi');
      if (titleRegex.test(translatedText)) {
        translatedText = translatedText.replace(titleRegex, (match) => {
          // Preserve the original case of the first letter
          const capitalizedAmerican = american.charAt(0).toUpperCase() + american.slice(1);
          return `<span class="highlight">${capitalizedAmerican}</span>`;
        });
        hasTranslation = true;
      }
    }

    return { text: translatedText, hasTranslation };
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = Translator;