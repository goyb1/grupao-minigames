const { normalize } = require('./questions');

// Cartas/personagens disponíveis no jogo. As dicas são geradas sem usar imagens ou textos oficiais.
const CLASH_NAMES = `
Archers
Archer Queen
Arrows
Baby Dragon
Balloon
Bandit
Barbarian Barrel
Barbarian Hut
Barbarians
Bats
Battle Healer
Battle Ram
Berserker
Bomb Tower
Bomber
Boss Bandit
Bowler
Cannon
Cannon Cart
Clone
Dark Prince
Dart Goblin
Earthquake
Electro Dragon
Electro Giant
Electro Spirit
Electro Wizard
Elixir Collector
Elixir Golem
Elite Barbarians
Executioner
Fire Spirit
Fireball
Firecracker
Fisherman
Flying Machine
Freeze
Furnace
Giant
Giant Skeleton
Giant Snowball
Goblin Barrel
Goblin Cage
Goblin Curse
Goblin Demolisher
Goblin Drill
Goblin Gang
Goblin Giant
Goblin Hut
Goblin Machine
Goblinstein
Goblins
Golden Knight
Golem
Graveyard
Guards
Heal Spirit
Hog Rider
Hunter
Ice Golem
Ice Spirit
Ice Wizard
Inferno Dragon
Inferno Tower
Knight
Lava Hound
Lightning
Little Prince
Lumberjack
Magic Archer
Mega Knight
Mega Minion
Mighty Miner
Miner
Mini P.E.K.K.A
Minion Horde
Minions
Mirror
Monk
Mortar
Mother Witch
Musketeer
Night Witch
P.E.K.K.A
Phoenix
Poison
Prince
Princess
Rage
Ram Rider
Rascals
Rocket
Royal Delivery
Royal Ghost
Royal Giant
Royal Hogs
Royal Recruits
Rune Giant
Skeleton Army
Skeleton Barrel
Skeleton Dragons
Skeleton King
Skeletons
Sparky
Spear Goblins
Spirit Empress
Suspicious Bush
Tesla
The Log
Three Musketeers
Tombstone
Tornado
Valkyrie
Vines
Void
Wall Breakers
Witch
Wizard
X-Bow
Zap
Zappies
Cannoneer
Dagger Duchess
Royal Chef
Tower Princess
Goblin Tower
Goblin Queen
Goblin Baby
Goblin Brawler
Royal Guardian
Skeleton Guard
`;

const names = [...new Set(CLASH_NAMES.trim().split('\n').map(v => v.trim()).filter(Boolean))];
const CLASH_QUESTIONS = names.map((answer, index) => {
  const clean = answer.replace(/[^A-Za-z0-9. ]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  const letters = clean.replace(/[^A-Za-z]/g, '');
  const initials = words.map(w => w[0]).join('.').toUpperCase();
  return {
    id: `clash-${index + 1}`,
    answer,
    aliases: [normalize(answer), normalize(answer.replace('The ', ''))],
    hints: [
      'É uma carta ou personagem de Clash Royale.',
      `Seu nome possui ${words.length} ${words.length === 1 ? 'palavra' : 'palavras'}.`,
      `O nome possui ${letters.length} letras, sem contar espaços e sinais.`,
      `As iniciais são ${initials}.`,
      `Começa com “${letters[0]}” e termina com “${letters.at(-1)}”.`
    ]
  };
});

module.exports = { CLASH_QUESTIONS };
