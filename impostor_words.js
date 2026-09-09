const IMPOSTOR_WORDS = [
  ['Jogos','Minecraft'],['Jogos','Fortnite'],['Jogos','Roblox'],['Jogos','Valorant'],['Jogos','Clash Royale'],['Jogos','Brawl Stars'],['Jogos','Among Us'],['Jogos','Rocket League'],['Jogos','GTA V'],['Jogos','Mario Kart'],
  ['Futebol','Cristiano Ronaldo'],['Futebol','Lionel Messi'],['Futebol','Neymar'],['Futebol','Mbappé'],['Futebol','Vini Jr.'],['Futebol','Real Madrid'],['Futebol','Barcelona'],['Futebol','Flamengo'],['Futebol','Champions League'],['Futebol','Copa do Mundo'],
  ['Comidas','Pizza'],['Comidas','Hambúrguer'],['Comidas','Brigadeiro'],['Comidas','Sorvete'],['Comidas','Batata frita'],['Comidas','Chocolate'],['Comidas','Pipoca'],['Comidas','Lasanha'],['Comidas','Coxinha'],['Comidas','Açaí'],
  ['Animais','Leão'],['Animais','Tubarão'],['Animais','Pinguim'],['Animais','Girafa'],['Animais','Golfinho'],['Animais','Cachorro'],['Animais','Gato'],['Animais','Elefante'],['Animais','Águia'],['Animais','Macaco'],
  ['Objetos','Celular'],['Objetos','Computador'],['Objetos','Televisão'],['Objetos','Mochila'],['Objetos','Relógio'],['Objetos','Fone de ouvido'],['Objetos','Controle'],['Objetos','Bicicleta'],['Objetos','Guarda-chuva'],['Objetos','Óculos'],
  ['Lugares','Praia'],['Lugares','Escola'],['Lugares','Shopping'],['Lugares','Estádio'],['Lugares','Cinema'],['Lugares','Parque'],['Lugares','Aeroporto'],['Lugares','Restaurante'],['Lugares','Hospital'],['Lugares','Supermercado']
].map(([category,word],index)=>({id:`impostor-${index+1}`,category,word}));

module.exports={IMPOSTOR_WORDS};
