const translations = {
  fr: {
    title: 'NIGHT FALL',
    gameOver: 'GAME OVER',
    youWin: 'YOU WIN',
    startPrompt: 'APPUYEZ SUR ESPACE OU CLIQUEZ POUR DÉMARRER',
    nameEntryHelp: 'HAUT/BAS : LETTRE — GAUCHE/DROITE : DÉPLACER — ESPACE : VALIDER',
    leaderboardHint: 'TAB : VOIR LE CLASSEMENT',
    leaderboardBackHint: 'TAB : RETOUR',
    score: (value) => `SCORE ${value}`,
    level: (value) => `NIVEAU ${value}`,
    bombs: (value) => `BOMBES ${value}`,
    lives: (value) => `VIES ${value}`,
    crashMessage: (value) => `ENCORE ${value} VIE${value > 1 ? 'S' : ''}`,
    introStory: [
      'VOUS ÊTES RICK VONDER MOLISCH, INSPECTEUR URBANISME VOLANT.',
      'MISSION : REDÉVELOPPER 10 VILLES MAL FICHUES,',
      'UN IMMEUBLE À LA FOIS.',
      "PERSONNE NE VOUS A DONNÉ DE PERMIS DE DÉMOLIR.",
      'TANT PIS.'
    ],
    missions: [
      { city: 'PÉTAOUCHNOK-SUR-MER', tagline: "Moins d'intérêt qu'un rond-point en zone industrielle." },
      { city: 'TROUILLARDVILLE', tagline: "L'architecte a paniqué dès la première brique." },
      { city: 'CAMEMBERT-LES-BAINS', tagline: 'Une odeur unique. Et on ne parle pas du fromage.' },
      { city: 'BÉTONVILLE-SUR-RIEN', tagline: "Jumelée avec le parking d'un centre commercial." },
      { city: 'ESCARGOT-PLAGE', tagline: 'Même les fonctionnaires trouvent que ça va trop lentement.' },
      { city: 'GRENOUILLAC-LES-TOURS', tagline: 'Le plan d\'urbanisme a été dessiné par un batracien mal réveillé.' },
      { city: 'RONFLEMONT', tagline: "Le genre de ville où un tracteur qui passe est l'événement de l'année." },
      { city: 'PAMPLEMOUSSE-CITY', tagline: "Aussi aigre que l'accueil à la mairie." },
      { city: 'SARDINE-LA-COINCÉE', tagline: "Le concept de l'espace personnel n'est jamais arrivé jusqu'ici." },
      { city: 'NOUGATVILLE-CAPITALE', tagline: 'Le boss final. Si vous survivez au diabète, vous resterez collé au bitume.' }
    ]
  },
  en: {
    title: 'NIGHT FALL',
    gameOver: 'GAME OVER',
    youWin: 'YOU WIN',
    startPrompt: 'PRESS SPACE OR CLICK TO START',
    nameEntryHelp: 'UP/DOWN: LETTER — LEFT/RIGHT: MOVE — SPACE: CONFIRM',
    leaderboardHint: 'TAB: VIEW LEADERBOARD',
    leaderboardBackHint: 'TAB: BACK',
    score: (value) => `SCORE ${value}`,
    level: (value) => `LEVEL ${value}`,
    bombs: (value) => `BOMBS ${value}`,
    lives: (value) => `LIVES ${value}`,
    crashMessage: (value) => `${value} ${value > 1 ? 'LIVES' : 'LIFE'} LEFT`,
    introStory: [
      'YOU ARE RICK VONDER MOLISCH, FLYING URBAN PLANNING INSPECTOR.',
      'MISSION: REDEVELOP 10 POORLY DESIGNED TOWNS,',
      'ONE BUILDING AT A TIME.',
      'NOBODY GAVE YOU A DEMOLITION PERMIT.',
      'OH WELL.'
    ],
    missions: [
      { city: 'NOWHERE-BY-THE-SEA', tagline: 'Officially less exciting than a traffic cone.' },
      { city: 'COWARD CREEK', tagline: 'Designed by an architect in the middle of a panic attack.' },
      { city: 'STINKYPOOL', tagline: "A unique aroma. And we're not talking about cheese." },
      { city: 'CONCRETEBURG', tagline: 'Proudly twinned with a shopping mall parking lot.' },
      { city: 'SNAILBEACH', tagline: 'Where even the sloths complain about the pace.' },
      { city: 'FROGSWORTH', tagline: 'Zoning laws written by an actual, highly confused toad.' },
      { city: 'SNOOZEBOROUGH', tagline: 'Where a passing tractor is considered peak nightlife.' },
      { city: 'GRAPEFRUITOPOLIS', tagline: "As bitter as the locals' hospitality." },
      { city: 'SARDINETOWN', tagline: 'Social distancing? Never heard of her.' },
      { city: 'STICKYVILLE CAPITAL', tagline: "The final boss. If the diabetes doesn't get you, the asphalt will." }
    ]
  }
};

// FR par défaut, EN si la langue du navigateur commence par "en"
export const language = navigator.language.toLowerCase().startsWith('en') ? 'en' : 'fr';
export const t = translations[language];
