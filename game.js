const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// joue un bip synthétisé : oscillateur (la fréquence) + gain (l'enveloppe de volume, pour un fondu propre)
function playTone({ frequency, endFrequency, duration, type = 'square', volume = 0.2 }) {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, audioContext.currentTime + duration);
  }

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function playBombSound() {
  playTone({ frequency: 400, endFrequency: 150, duration: 0.15, type: 'square' });
}

function playExplosionSound() {
  playTone({ frequency: 150, endFrequency: 40, duration: 0.4, type: 'sawtooth', volume: 0.3 });
}

function playLevelUpSound() {
  playTone({ frequency: 440, endFrequency: 880, duration: 0.3, type: 'sine', volume: 0.2 });
}

function playGameOverSound() {
  playTone({ frequency: 300, endFrequency: 80, duration: 0.6, type: 'sawtooth', volume: 0.25 });
}

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
const language = navigator.language.toLowerCase().startsWith('en') ? 'en' : 'fr';
const t = translations[language];
document.documentElement.lang = language;
document.getElementById('backLink').href = `https://www.akrolabs.fr/${language}/labs/`;

const unit = 10; // taille d'un "bloc" du pixel art, partagée par l'avion et les immeubles

const baseSpeed = 3;
const baseDescentStep = 10;

const plane = {
  x: 0,
  y: 50,
  width: 40,
  height: 20,
  speed: baseSpeed,
  direction: 1, // 1 = vers la droite, -1 = vers la gauche
  descentStep: baseDescentStep, // de combien l'avion descend à chaque sortie d'écran
  landingSpeed: 2, // vitesse de descente une fois tous les immeubles détruits
  isLanding: false
};

// +5% de vitesse par niveau
function speedForLevel(currentLevel) {
  return baseSpeed * Math.pow(1.05, currentLevel - 1);
}

// +5% de descente par passage par niveau : de moins en moins de passages avant le risque de collision
function descentStepForLevel(currentLevel) {
  return baseDescentStep * Math.pow(1.05, currentLevel - 1);
}

let score = 0;
let level = 1;
let lives = 3;

// 'start' = écran d'accueil, 'playing' = en jeu, 'crashed' = pause après un crash,
// 'enterName' = saisie du pseudo, 'result' = fin de run (victoire ou défaite) + classement
let gameState = 'start';
let outcomeTitle = ''; // t.youWin ou t.gameOver, affiché sur les écrans 'enterName' et 'result'

const leaderboardKey = 'nightFallLeaderboard';
const leaderboardSize = 10;

function loadLeaderboard() {
  try {
    const stored = localStorage.getItem(leaderboardKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function saveLeaderboard() {
  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
}

let leaderboard = loadLeaderboard();
let playerInitials = ['A', 'A', 'A'];
let initialsSlotIndex = 0;
let pendingScore = 0;

let crashTimer = 0;
const crashDuration = 90; // en frames, ~1.5s à 60fps
let crashX = 0;
let crashY = 0;

const buildingCount = canvas.width / unit;
const buildings = [];

function createBuildings() {
  buildings.length = 0;

  for (let i = 0; i < buildingCount; i++) {
    const height = Math.floor(Math.random() * 150) + 50; // entre 50 et 200px

    buildings.push({
      x: i * unit,
      width: unit,
      height: height
    });
  }
}

const maxLevel = 10;

// 5 bombes aux niveaux 1-2, 4 aux niveaux 3-4, 3 à partir du niveau 5
function bombsForLevel(currentLevel) {
  if (currentLevel <= 2) return 5;
  if (currentLevel <= 4) return 4;
  return 3;
}

// niveau 1 : hommage monochrome jaune/noir au Blitz original
const level1Color = '#f2c94c';

// une teinte différente par niveau (roue chromatique divisée en 10), sauf le niveau 1
function buildingColorForLevel(currentLevel) {
  if (currentLevel === 1) return level1Color;

  const hue = ((currentLevel - 1) * 36) % 360;
  return `hsl(${hue}, 55%, 55%)`;
}

function planeColorForLevel(currentLevel) {
  return currentLevel === 1 ? level1Color : '#dfe6f0';
}

function bombColorForLevel(currentLevel) {
  return currentLevel === 1 ? level1Color : '#f2c94c';
}

function backgroundColorForLevel(currentLevel) {
  return currentLevel === 1 ? '#000000' : '#0b1035';
}

let bombs = [];
let bombsPerPassage = bombsForLevel(level);
let bombsRemaining = bombsPerPassage;
let buildingColor = buildingColorForLevel(level);
let planeColor = planeColorForLevel(level);
let bombColor = bombColorForLevel(level);
let backgroundColor = backgroundColorForLevel(level);
const bombSize = unit;
const bombSpeed = 4;

// plus l'avion va vite, descend vite, et a peu de bombes, plus un immeuble rapporte de points
function buildingPoints() {
  const basePoints = 10;
  return Math.round((basePoints * (plane.speed + plane.descentStep)) / bombsPerPassage);
}

function dropBomb() {
  if (bombsRemaining <= 0) return;

  bombsRemaining--;
  playBombSound();

  bombs.push({
    x: plane.x + plane.width / 2 - bombSize / 2,
    y: plane.y + plane.height,
    width: bombSize,
    height: bombSize
  });
}

function handleAction() {
  if (gameState === 'start' || gameState === 'result') {
    startGame();
  } else if (gameState === 'playing') {
    dropBomb();
  }
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function confirmInitials() {
  leaderboard.push({ name: playerInitials.join(''), score: pendingScore });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, leaderboardSize);
  saveLeaderboard();

  gameState = 'result';
}

function handleNameEntryKey(event) {
  if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
    const currentIndex = alphabet.indexOf(playerInitials[initialsSlotIndex]);
    const direction = event.code === 'ArrowUp' ? 1 : -1;
    const nextIndex = (currentIndex + direction + alphabet.length) % alphabet.length;
    playerInitials[initialsSlotIndex] = alphabet[nextIndex];
  } else if (event.code === 'ArrowLeft') {
    initialsSlotIndex = Math.max(0, initialsSlotIndex - 1);
  } else if (event.code === 'ArrowRight') {
    initialsSlotIndex = Math.min(playerInitials.length - 1, initialsSlotIndex + 1);
  } else if (event.code === 'Space' || event.code === 'Enter') {
    if (initialsSlotIndex < playerInitials.length - 1) {
      initialsSlotIndex++;
    } else {
      confirmInitials();
    }
  }
}

function qualifiesForLeaderboard(candidateScore) {
  return leaderboard.length < leaderboardSize || candidateScore > leaderboard[leaderboard.length - 1].score;
}

// fin de partie commune : victoire ou défaite, avec passage par la saisie du pseudo si le score qualifie
function endRun(title) {
  outcomeTitle = title;
  pendingScore = score;

  if (qualifiesForLeaderboard(pendingScore)) {
    playerInitials = ['A', 'A', 'A'];
    initialsSlotIndex = 0;
    gameState = 'enterName';
  } else {
    gameState = 'result';
  }
}

function winGame() {
  playLevelUpSound();
  endRun(t.youWin);
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Escape') {
    gameState = 'start';
    return;
  }

  if (gameState === 'enterName') {
    handleNameEntryKey(event);
    return;
  }

  if (event.code === 'Space') {
    handleAction();
  }
});

canvas.addEventListener('click', handleAction);

function checkCollisions() {
  for (const bomb of bombs) {
    for (const building of buildings) {
      if (building.height <= 0) continue;

      const overlapsHorizontally =
        bomb.x < building.x + building.width &&
        bomb.x + bomb.width > building.x;

      if (!overlapsHorizontally) continue;

      // ce qu'il reste de l'immeuble sous la pointe de la bombe
      const remainingHeight = canvas.height - (bomb.y + bomb.height);
      const newHeight = Math.max(0, Math.min(building.height, remainingHeight));

      if (newHeight === 0 && building.height > 0) {
        score += buildingPoints();
      }

      building.height = newHeight;
    }
  }
}

function allBuildingsDestroyed() {
  return buildings.every((building) => building.height <= 0);
}

function resetPlane() {
  plane.x = 0;
  plane.y = 50;
  plane.direction = 1;
  bombsRemaining = bombsPerPassage;
}

function crash() {
  lives--;
  crashX = plane.x;
  crashY = plane.y;
  playExplosionSound();

  if (lives <= 0) {
    playGameOverSound();
    endRun(t.gameOver);
    return;
  }

  gameState = 'crashed';
  crashTimer = crashDuration;
}

// regroupe tout ce qui dépend du niveau (difficulté + palette)
function applyLevelSettings() {
  bombsPerPassage = bombsForLevel(level);
  buildingColor = buildingColorForLevel(level);
  planeColor = planeColorForLevel(level);
  bombColor = bombColorForLevel(level);
  backgroundColor = backgroundColorForLevel(level);
  plane.speed = speedForLevel(level);
  plane.descentStep = descentStepForLevel(level);
}

function startGame() {
  score = 0;
  level = 1;
  lives = 3;
  applyLevelSettings();

  createBuildings();
  resetPlane();
  plane.isLanding = false;
  bombs = [];

  gameState = 'playing';
}

function checkPlaneCollision() {
  for (const building of buildings) {
    if (building.height <= 0) continue;

    const buildingY = canvas.height - building.height;
    const collides =
      plane.x < building.x + building.width &&
      plane.x + plane.width > building.x &&
      plane.y < buildingY + building.height &&
      plane.y + plane.height > buildingY;

    if (collides) {
      crash();
      return;
    }
  }
}

function startNextLevel() {
  level = Math.min(level + 1, maxLevel);
  applyLevelSettings();
  playLevelUpSound();

  createBuildings();
  resetPlane();
  plane.isLanding = false;
  bombs = [];
}

function updateBombs() {
  for (const bomb of bombs) {
    bomb.y += bombSpeed;
  }

  checkCollisions();

  bombs = bombs.filter((bomb) => bomb.y < canvas.height);
}

function updateLanding() {
  plane.x += plane.speed * plane.direction;
  plane.y = Math.min(plane.y + plane.landingSpeed, canvas.height - plane.height);

  if (plane.y >= canvas.height - plane.height) {
    if (level >= maxLevel) {
      winGame();
    } else {
      startNextLevel();
    }
  }
}

function update() {
  if (gameState !== 'playing' && gameState !== 'crashed') return;

  if (gameState === 'crashed') {
    crashTimer--;

    if (crashTimer <= 0) {
      resetPlane();
      gameState = 'playing';
    }

    return;
  }

  if (plane.isLanding) {
    updateLanding();
    updateBombs();
    return;
  }

  plane.x += plane.speed * plane.direction;

  // l'avion doit être complètement sorti de l'écran avant de faire demi-tour
  const exitedRight = plane.direction === 1 && plane.x >= canvas.width;
  const exitedLeft = plane.direction === -1 && plane.x + plane.width <= 0;

  if (exitedRight || exitedLeft) {
    plane.direction *= -1;
    plane.y += plane.descentStep;
    bombsRemaining = bombsPerPassage;
  }

  checkPlaneCollision();

  updateBombs();

  if (allBuildingsDestroyed()) {
    plane.isLanding = true;
  }
}

function drawPlane() {
  ctx.fillStyle = planeColor;

  // le corps : 4 carrés alignés
  ctx.fillRect(plane.x, plane.y + unit, unit * 4, unit);

  // la dérive : toujours à l'arrière de l'avion, donc son côté dépend du sens de vol
  const finX = plane.direction === 1 ? plane.x : plane.x + unit * 3;
  ctx.fillRect(finX, plane.y, unit, unit);
}

function drawBuildings() {
  ctx.fillStyle = buildingColor;

  for (const building of buildings) {
    ctx.fillRect(building.x, canvas.height - building.height, building.width, building.height);
  }
}

function drawBombs() {
  ctx.fillStyle = bombColor;

  for (const bomb of bombs) {
    if (level === 1) {
      // niveau 1 : carré, fidèle au Blitz original
      ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
    } else {
      // niveaux suivants : disque
      const centerX = bomb.x + bomb.width / 2;
      const centerY = bomb.y + bomb.height / 2;
      const radius = bomb.width / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawHud() {
  ctx.fillStyle = '#dfe6f0';
  ctx.font = '16px monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';

  const columnWidth = canvas.width / 4;
  const texts = [t.level(level), t.lives(lives), t.bombs(bombsRemaining), t.score(score)];

  texts.forEach((text, index) => {
    ctx.fillText(text, columnWidth * index + columnWidth / 2, 10);
  });
}

function drawExplosion() {
  const elapsed = crashDuration - crashTimer;
  const radius = Math.min(unit * 3, elapsed * 1.5);
  const centerX = crashX + plane.width / 2;
  const centerY = crashY + plane.height / 2;
  const colors = ['#f2c94c', '#f2994a', '#eb5757'];

  const points = [
    { dx: 0, dy: 0 },
    { dx: radius, dy: 0 },
    { dx: -radius, dy: 0 },
    { dx: 0, dy: radius },
    { dx: 0, dy: -radius },
    { dx: radius * 0.7, dy: radius * 0.7 },
    { dx: -radius * 0.7, dy: -radius * 0.7 }
  ];

  points.forEach((point, index) => {
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(centerX + point.dx - unit / 2, centerY + point.dy - unit / 2, unit, unit);
  });
}

function drawCrashMessage() {
  ctx.fillStyle = '#dfe6f0';
  ctx.font = '20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t.crashMessage(lives), canvas.width / 2, canvas.height / 2);
}

const leaderboardRowHeight = 28;

function drawLeaderboardList(startY, rowHeight = leaderboardRowHeight) {
  ctx.fillStyle = '#dfe6f0';
  ctx.font = '18px monospace';
  ctx.textAlign = 'center';

  for (let rank = 0; rank < leaderboardSize; rank++) {
    const entry = leaderboard[rank];
    const name = entry ? entry.name : '---';
    const entryScore = entry ? entry.score : '-';
    ctx.fillText(`${rank + 1}. ${name}  ${entryScore}`, canvas.width / 2, startY + rank * rowHeight);
  }
}

const titleSkyline = [];

function createTitleSkyline() {
  const skylineBuildingWidth = unit * 2;
  const count = Math.ceil(canvas.width / skylineBuildingWidth);

  for (let i = 0; i < count; i++) {
    titleSkyline.push({
      x: i * skylineBuildingWidth,
      width: skylineBuildingWidth,
      height: Math.floor(Math.random() * 20) + 20 // silhouette discrète, 20-40px
    });
  }
}

createTitleSkyline();

function drawTitleSkyline() {
  ctx.fillStyle = 'rgba(74, 90, 159, 0.5)';

  for (const building of titleSkyline) {
    ctx.fillRect(building.x, canvas.height - building.height, building.width, building.height);
  }
}

function drawStartScreen() {
  drawTitleSkyline();

  ctx.fillStyle = '#dfe6f0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleY = 45;
  const promptY = canvas.height - 60;

  // classement centré dans l'espace restant entre le titre et le message du bas
  const leaderboardBlockHeight = (leaderboardSize - 1) * leaderboardRowHeight;
  const leaderboardStartY = titleY + (promptY - titleY - leaderboardBlockHeight) / 2;

  ctx.font = '40px monospace';
  ctx.fillText(t.title, canvas.width / 2, titleY);

  drawLeaderboardList(leaderboardStartY);

  ctx.font = '16px monospace';
  ctx.fillText(t.startPrompt, canvas.width / 2, promptY);
}

function drawNameEntry() {
  ctx.fillStyle = '#dfe6f0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '40px monospace';
  ctx.fillText(outcomeTitle, canvas.width / 2, canvas.height / 2 - 100);

  ctx.font = '20px monospace';
  ctx.fillText(t.score(pendingScore), canvas.width / 2, canvas.height / 2 - 50);

  ctx.font = '48px monospace';
  const lettersText = playerInitials
    .map((letter, index) => (index === initialsSlotIndex ? `[${letter}]` : ` ${letter} `))
    .join(' ');
  ctx.fillText(lettersText, canvas.width / 2, canvas.height / 2 + 20);

  ctx.font = '14px monospace';
  ctx.fillText(t.nameEntryHelp, canvas.width / 2, canvas.height / 2 + 90);
}

function drawResult() {
  ctx.fillStyle = '#dfe6f0';
  ctx.textAlign = 'center';

  ctx.font = '32px monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(outcomeTitle, canvas.width / 2, 50);

  ctx.font = '20px monospace';
  ctx.fillText(t.score(pendingScore), canvas.width / 2, 90);

  drawLeaderboardList(140);

  ctx.font = '14px monospace';
  ctx.fillText(t.startPrompt, canvas.width / 2, canvas.height - 30);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'start') {
    drawStartScreen();
    return;
  }

  if (gameState === 'enterName') {
    drawNameEntry();
    return;
  }

  if (gameState === 'result') {
    drawResult();
    return;
  }

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBuildings();
  drawBombs();

  if (gameState === 'crashed') {
    drawExplosion();
    drawCrashMessage();
  } else {
    drawPlane();
  }

  drawHud();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
