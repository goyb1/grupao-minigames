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

// Cartas do HTML de referência, com pistas completas de jogabilidade.
const DETAILED = {
  'Skeleton Army':['É uma tropa terrestre.','Sua raridade é Épica.','Custa 3 de elixir.','Coloca muitas unidades frágeis na arena.','É excelente para cercar tropas de alvo único.'],
  Wizard:['É uma tropa que acerta unidades terrestres e aéreas.','Sua raridade é Rara.','Custa 5 de elixir.','Ataca à distância e causa dano em área.','Seus projéteis são bolas de fogo.'],
  'Mini P.E.K.K.A':['É uma tropa terrestre.','Sua raridade é Rara.','Custa 4 de elixir.','Causa muito dano em um único alvo.','É a versão menor de uma unidade blindada famosa.'],
  'Baby Dragon':['É uma tropa voadora.','Sua raridade é Épica.','Custa 4 de elixir.','Seu ataque causa dano em área.','É um dragão jovem.'],
  Musketeer:['É uma tropa terrestre de longo alcance.','Sua raridade é Rara.','Custa 4 de elixir.','Ataca alvos terrestres e aéreos.','Usa um mosquete.'],
  Valkyrie:['É uma tropa terrestre.','Sua raridade é Rara.','Custa 4 de elixir.','Seu ataque acerta todos os inimigos ao redor.','É uma guerreira de cabelo laranja.'],
  Prince:['É uma tropa terrestre.','Sua raridade é Épica.','Custa 5 de elixir.','Sua investida aumenta bastante o dano.','Luta montado e usa uma lança.'],
  'Goblin Barrel':['É um feitiço lançado em qualquer ponto da arena.','Sua raridade é Épica.','Custa 3 de elixir.','Pode ser jogado diretamente sobre uma torre.','Ao cair, libera três Goblins.'],
  Fireball:['É um feitiço.','Sua raridade é Rara.','Custa 4 de elixir.','Causa dano e empurra inimigos em uma área.','Lança um grande projétil em chamas.'],
  Zap:['É um feitiço instantâneo.','Sua raridade é Comum.','Custa 2 de elixir.','Atinge alvos terrestres e aéreos em uma pequena área.','Reinicia ataques e causa um breve atordoamento.'],
  'Hog Rider':['É uma tropa terrestre.','Sua raridade é Rara.','Custa 4 de elixir.','Ataca apenas construções.','Salta o rio e corre com um martelo.'],
  'Mega Knight':['É uma tropa terrestre.','Sua raridade é Lendária.','Custa 7 de elixir.','Causa dano em área ao entrar na arena.','Salta sobre inimigos que estão a certa distância.'],
  Miner:['É uma tropa terrestre.','Sua raridade é Lendária.','Custa 3 de elixir.','Pode ser colocado em qualquer ponto da arena.','Viaja cavando por baixo da terra.'],
  'Royal Ghost':['É uma tropa terrestre.','Sua raridade é Lendária.','Custa 3 de elixir.','Seu ataque causa dano em área.','Fica invisível enquanto não está atacando.'],
  'Inferno Dragon':['É uma tropa voadora.','Sua raridade é Lendária.','Custa 4 de elixir.','Ataca um alvo por vez.','Seu dano aumenta enquanto mantém o raio no mesmo alvo.']
};

const SPELLS = new Set('Arrows Barbarian Barrel Clone Earthquake Fireball Freeze Giant Snowball Goblin Barrel Goblin Curse Graveyard Lightning Mirror Poison Rage Rocket Royal Delivery The Log Tornado Vines Void Zap'.split('|').flatMap(v=>v.split('|')));
['Arrows','Barbarian Barrel','Clone','Earthquake','Fireball','Freeze','Giant Snowball','Goblin Barrel','Goblin Curse','Graveyard','Lightning','Mirror','Poison','Rage','Rocket','Royal Delivery','The Log','Tornado','Vines','Void','Zap'].forEach(v=>SPELLS.add(v));
const BUILDINGS = new Set(['Barbarian Hut','Bomb Tower','Cannon','Elixir Collector','Furnace','Goblin Cage','Goblin Drill','Goblin Hut','Inferno Tower','Mortar','Tesla','Tombstone','X-Bow']);
const FLYING = new Set(['Baby Dragon','Balloon','Bats','Electro Dragon','Flying Machine','Inferno Dragon','Lava Hound','Mega Minion','Minion Horde','Minions','Phoenix','Skeleton Barrel','Skeleton Dragons']);
const BUILDING_TARGETERS = new Set(['Balloon','Battle Ram','Electro Giant','Elixir Golem','Giant','Goblin Giant','Golem','Hog Rider','Ice Golem','Lava Hound','Ram Rider','Royal Giant','Royal Hogs','Wall Breakers']);
const GROUPS = new Set(['Archers','Barbarians','Bats','Elite Barbarians','Goblin Gang','Goblins','Guards','Minion Horde','Minions','Rascals','Royal Hogs','Royal Recruits','Skeleton Army','Skeleton Dragons','Skeletons','Spear Goblins','Three Musketeers','Wall Breakers','Zappies']);
const PT = {'Skeleton Army':'Exército de Esqueletos',Wizard:'Mago','Mini P.E.K.K.A':'Mini P.E.K.K.A','Baby Dragon':'Bebê Dragão',Musketeer:'Mosqueteira',Valkyrie:'Valquíria',Prince:'Príncipe','Goblin Barrel':'Barril de Goblins',Fireball:'Bola de Fogo','Hog Rider':'Corredor','Mega Knight':'Mega Cavaleiro',Miner:'Mineiro','Royal Ghost':'Fantasma Real','Inferno Dragon':'Dragão Infernal',Archers:'Arqueiras',Arrows:'Flechas',Balloon:'Balão',Bandit:'Bandida',Barbarians:'Bárbaros',Bats:'Morcegos',Bomber:'Bombardeiro',Bowler:'Lançador',Cannon:'Canhão','Dark Prince':'Príncipe das Trevas','Dart Goblin':'Goblin com Dardo','Electro Dragon':'Dragão Elétrico','Electro Giant':'Gigante Elétrico','Electro Spirit':'Espírito Elétrico','Electro Wizard':'Mago Elétrico','Elite Barbarians':'Bárbaros de Elite',Executioner:'Executor','Fire Spirit':'Espírito de Fogo',Firecracker:'Pirotécnica',Fisherman:'Pescador',Freeze:'Congelamento',Giant:'Gigante','Giant Skeleton':'Esqueleto Gigante','Giant Snowball':'Bola de Neve',Goblins:'Goblins','Golden Knight':'Cavaleiro Dourado',Golem:'Golem',Graveyard:'Cemitério',Guards:'Guardas','Heal Spirit':'Espírito Curador',Hunter:'Caçador','Ice Golem':'Golem de Gelo','Ice Spirit':'Espírito de Gelo','Ice Wizard':'Mago de Gelo',Knight:'Cavaleiro','Lava Hound':'Cão de Lava',Lightning:'Relâmpago',Lumberjack:'Lenhador','Magic Archer':'Arqueiro Mágico','Mega Minion':'Mega Servo','Mighty Miner':'Mineiro Bombado',Minions:'Servos',Monk:'Monge',Mortar:'Morteiro','Mother Witch':'Bruxa Mãe','Night Witch':'Bruxa Sombria','P.E.K.K.A':'P.E.K.K.A',Poison:'Veneno',Princess:'Princesa',Rage:'Fúria','Ram Rider':'Domadora de Carneiro',Rascals:'Patifes',Rocket:'Foguete','Royal Giant':'Gigante Real','Royal Hogs':'Porcos Reais','Royal Recruits':'Recrutas Reais',Skeletons:'Esqueletos',Sparky:'Sparky','Spear Goblins':'Goblins Lanceiros',Tesla:'Tesla','The Log':'O Tronco','Three Musketeers':'Três Mosqueteiras',Tombstone:'Lápide',Tornado:'Tornado','Wall Breakers':'Quebra-Muros',Witch:'Bruxa','X-Bow':'X-Besta',Zappies:'Zappies'};

function fallbackHints(answer){
  const type=SPELLS.has(answer)?'Feitiço':BUILDINGS.has(answer)?'Construção':'Tropa';
  const movement=FLYING.has(answer)?'voadora':'terrestre';
  const quantity=GROUPS.has(answer)?'Coloca várias unidades na arena.':'É representada por uma única unidade ou efeito principal.';
  const role=BUILDING_TARGETERS.has(answer)?'Prioriza construções como alvo.':type==='Construção'?'Permanece posicionada no seu lado da arena.':type==='Feitiço'?'Seu efeito acontece na área escolhida pelo jogador.':'Pode ser usada para atacar ou defender durante a batalha.';
  const theme=answer.includes('Goblin')?'Tem ligação com a família dos Goblins.':answer.includes('Skeleton')?'Tem ligação com os Esqueletos.':answer.includes('Royal')?'Faz parte da família Real.':answer.includes('Electro')||answer.includes('Zap')?'Sua identidade está ligada à eletricidade.':answer.includes('Ice')||answer==='Freeze'?'Sua identidade está ligada ao gelo.':answer.includes('Fire')?'Sua identidade está ligada ao fogo.':`É conhecida em português como “${PT[answer]||answer}”.`;
  return [`É ${type==='Tropa'?`uma tropa ${movement}`:`um ${type.toLowerCase()}`}.`,quantity,role,theme,`Seu nome no jogo é ${PT[answer]||answer}.`];
}

const CLASH_QUESTIONS = names.map((answer,index)=>({
  id:`clash-${index+1}`,
  answer:PT[answer]||answer,
  aliases:[normalize(answer),normalize(answer.replace('The ','')),normalize(PT[answer]||answer)],
  hints:DETAILED[answer]||fallbackHints(answer)
}));

module.exports = { CLASH_QUESTIONS };
