const translations = {
  fr: {
    title: 'NIGHT FALL',
    gameOver: 'GAME OVER',
    youWin: 'YOU WIN',
    startPrompt: 'APPUYEZ SUR ESPACE OU CLIQUEZ',
    nameEntryHelp: 'HAUT/BAS : LETTRE — GAUCHE/DROITE : DÉPLACER — ESPACE : VALIDER',
    score: (value) => `SCORE ${value}`,
    level: (value) => `NIVEAU ${value}`,
    bombs: (value) => `BOMBES ${value}`,
    lives: (value) => `VIES ${value}`,
    crashMessage: (value) => `ENCORE ${value} VIE${value > 1 ? 'S' : ''}`
  },
  en: {
    title: 'NIGHT FALL',
    gameOver: 'GAME OVER',
    youWin: 'YOU WIN',
    startPrompt: 'PRESS SPACE OR CLICK',
    nameEntryHelp: 'UP/DOWN: LETTER — LEFT/RIGHT: MOVE — SPACE: CONFIRM',
    score: (value) => `SCORE ${value}`,
    level: (value) => `LEVEL ${value}`,
    bombs: (value) => `BOMBS ${value}`,
    lives: (value) => `LIVES ${value}`,
    crashMessage: (value) => `${value} ${value > 1 ? 'LIVES' : 'LIFE'} LEFT`
  }
};

// FR par défaut, EN si la langue du navigateur commence par "en"
export const language = navigator.language.toLowerCase().startsWith('en') ? 'en' : 'fr';
export const t = translations[language];
