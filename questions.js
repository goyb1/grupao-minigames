// 250 nomes conhecidos, cada um com duas combinações de dicas = 500 desafios.
const PLAYER_ROWS = `
Neymar|Brasil|atacante|Santos, Barcelona e PSG|anos 2010 e 2020
Pelé|Brasil|atacante|Santos e New York Cosmos|anos 1950 a 1970
Garrincha|Brasil|ponta|Botafogo|anos 1950 e 1960
Zico|Brasil|meio-campista|Flamengo e Udinese|anos 1970 e 1980
Romário|Brasil|atacante|Vasco, PSV e Barcelona|anos 1980 a 2000
Ronaldo Fenômeno|Brasil|atacante|PSV, Barcelona, Inter e Real Madrid|anos 1990 e 2000
Ronaldinho Gaúcho|Brasil|meio-campista|Grêmio, PSG, Barcelona e Milan|anos 2000
Rivaldo|Brasil|meio-campista|Palmeiras, Barcelona e Milan|anos 1990 e 2000
Kaká|Brasil|meio-campista|São Paulo, Milan e Real Madrid|anos 2000 e 2010
Roberto Carlos|Brasil|lateral|Palmeiras, Inter e Real Madrid|anos 1990 e 2000
Cafu|Brasil|lateral|São Paulo, Roma e Milan|anos 1990 e 2000
Sócrates|Brasil|meio-campista|Botafogo-SP, Corinthians e Fiorentina|anos 1970 e 1980
Falcão|Brasil|meio-campista|Internacional e Roma|anos 1970 e 1980
Jairzinho|Brasil|ponta|Botafogo|anos 1960 e 1970
Tostão|Brasil|atacante|Cruzeiro|anos 1960 e 1970
Rivellino|Brasil|meio-campista|Corinthians e Fluminense|anos 1960 e 1970
Didi|Brasil|meio-campista|Fluminense, Botafogo e Real Madrid|anos 1950 e 1960
Nilton Santos|Brasil|lateral|Botafogo|anos 1940 a 1960
Carlos Alberto Torres|Brasil|lateral|Santos, Fluminense e New York Cosmos|anos 1960 e 1970
Cláudio Taffarel|Brasil|goleiro|Internacional, Parma e Galatasaray|anos 1980 e 1990
Dida|Brasil|goleiro|Cruzeiro, Corinthians e Milan|anos 1990 e 2000
Lúcio|Brasil|zagueiro|Bayer Leverkusen, Bayern e Inter|anos 2000 e 2010
Thiago Silva|Brasil|zagueiro|Fluminense, Milan, PSG e Chelsea|anos 2000 a 2020
Marcelo|Brasil|lateral|Fluminense e Real Madrid|anos 2000 a 2020
Casemiro|Brasil|meio-campista|São Paulo, Real Madrid e Manchester United|anos 2010 e 2020
Vinícius Júnior|Brasil|ponta|Flamengo e Real Madrid|anos 2010 e 2020
Rodrygo|Brasil|ponta|Santos e Real Madrid|anos 2010 e 2020
Gabriel Jesus|Brasil|atacante|Palmeiras, Manchester City e Arsenal|anos 2010 e 2020
Endrick|Brasil|atacante|Palmeiras e Real Madrid|anos 2020
Alisson|Brasil|goleiro|Internacional, Roma e Liverpool|anos 2010 e 2020
Ederson|Brasil|goleiro|Benfica e Manchester City|anos 2010 e 2020
Marquinhos|Brasil|zagueiro|Corinthians, Roma e PSG|anos 2010 e 2020
Júlio César|Brasil|goleiro|Flamengo, Inter e Benfica|anos 2000 e 2010
Adriano Imperador|Brasil|atacante|Flamengo, Parma e Inter|anos 2000
Robinho|Brasil|ponta|Santos, Real Madrid e Milan|anos 2000 e 2010
Luís Fabiano|Brasil|atacante|São Paulo, Porto e Sevilla|anos 2000 e 2010
Juninho Pernambucano|Brasil|meio-campista|Vasco e Lyon|anos 1990 e 2000
Denílson|Brasil|ponta|São Paulo e Betis|anos 1990 e 2000
Bebeto|Brasil|atacante|Flamengo, Vasco e Deportivo|anos 1980 e 1990
Careca|Brasil|atacante|Guarani, São Paulo e Napoli|anos 1980 e 1990
Cristiano Ronaldo|Portugal|atacante|Sporting, Manchester United, Real Madrid e Juventus|anos 2000 a 2020
Luís Figo|Portugal|ponta|Sporting, Barcelona, Real Madrid e Inter|anos 1990 e 2000
Eusébio|Portugal|atacante|Benfica|anos 1960 e 1970
Deco|Portugal|meio-campista|Porto, Barcelona e Chelsea|anos 2000
Pepe|Portugal|zagueiro|Porto, Real Madrid e Besiktas|anos 2000 a 2020
Rui Costa|Portugal|meio-campista|Benfica, Fiorentina e Milan|anos 1990 e 2000
Bruno Fernandes|Portugal|meio-campista|Sporting e Manchester United|anos 2010 e 2020
Bernardo Silva|Portugal|meio-campista|Monaco e Manchester City|anos 2010 e 2020
João Félix|Portugal|atacante|Benfica, Atlético de Madrid e Barcelona|anos 2010 e 2020
Lionel Messi|Argentina|atacante|Barcelona, PSG e Inter Miami|anos 2000 a 2020
Diego Maradona|Argentina|meio-campista|Boca Juniors, Barcelona e Napoli|anos 1970 a 1990
Alfredo Di Stéfano|Argentina e Espanha|atacante|River Plate e Real Madrid|anos 1940 a 1960
Gabriel Batistuta|Argentina|atacante|Fiorentina e Roma|anos 1990 e 2000
Juan Román Riquelme|Argentina|meio-campista|Boca Juniors, Barcelona e Villarreal|anos 1990 e 2000
Javier Zanetti|Argentina|lateral|Banfield e Inter|anos 1990 a 2010
Ángel Di María|Argentina|ponta|Benfica, Real Madrid, Manchester United e PSG|anos 2000 a 2020
Sergio Agüero|Argentina|atacante|Independiente, Atlético de Madrid e Manchester City|anos 2000 e 2010
Javier Mascherano|Argentina|meio-campista|River Plate, Liverpool e Barcelona|anos 2000 e 2010
Hernán Crespo|Argentina|atacante|River Plate, Parma, Lazio e Inter|anos 1990 e 2000
Gonzalo Higuaín|Argentina|atacante|River Plate, Real Madrid, Napoli e Juventus|anos 2000 e 2010
Paulo Dybala|Argentina|atacante|Palermo, Juventus e Roma|anos 2010 e 2020
Lautaro Martínez|Argentina|atacante|Racing e Inter|anos 2010 e 2020
Emiliano Martínez|Argentina|goleiro|Arsenal e Aston Villa|anos 2010 e 2020
Enzo Fernández|Argentina|meio-campista|River Plate, Benfica e Chelsea|anos 2020
Luis Suárez|Uruguai|atacante|Ajax, Liverpool, Barcelona e Atlético de Madrid|anos 2000 a 2020
Edinson Cavani|Uruguai|atacante|Palermo, Napoli, PSG e Manchester United|anos 2000 a 2020
Diego Forlán|Uruguai|atacante|Manchester United, Villarreal e Atlético de Madrid|anos 2000 e 2010
Federico Valverde|Uruguai|meio-campista|Peñarol e Real Madrid|anos 2010 e 2020
Darwin Núñez|Uruguai|atacante|Almería, Benfica e Liverpool|anos 2010 e 2020
Zinedine Zidane|França|meio-campista|Bordeaux, Juventus e Real Madrid|anos 1990 e 2000
Michel Platini|França|meio-campista|Nancy, Saint-Étienne e Juventus|anos 1970 e 1980
Thierry Henry|França|atacante|Monaco, Arsenal e Barcelona|anos 1990 a 2010
Kylian Mbappé|França|atacante|Monaco, PSG e Real Madrid|anos 2010 e 2020
Karim Benzema|França|atacante|Lyon e Real Madrid|anos 2000 a 2020
Antoine Griezmann|França|atacante|Real Sociedad, Atlético de Madrid e Barcelona|anos 2010 e 2020
Patrick Vieira|França|meio-campista|Arsenal, Juventus, Inter e Manchester City|anos 1990 e 2000
Claude Makélélé|França|meio-campista|Celta, Real Madrid e Chelsea|anos 1990 e 2000
Didier Deschamps|França|meio-campista|Marseille, Juventus e Chelsea|anos 1980 e 1990
Marcel Desailly|França|zagueiro|Marseille, Milan e Chelsea|anos 1990 e 2000
Franck Ribéry|França|ponta|Marseille, Bayern e Fiorentina|anos 2000 e 2010
N'Golo Kanté|França|meio-campista|Leicester e Chelsea|anos 2010 e 2020
Paul Pogba|França|meio-campista|Manchester United e Juventus|anos 2010 e 2020
Olivier Giroud|França|atacante|Montpellier, Arsenal, Chelsea e Milan|anos 2010 e 2020
Lilian Thuram|França|zagueiro|Monaco, Parma, Juventus e Barcelona|anos 1990 e 2000
Fabien Barthez|França|goleiro|Marseille e Manchester United|anos 1990 e 2000
Raymond Kopa|França|meio-campista|Reims e Real Madrid|anos 1950 e 1960
Just Fontaine|França|atacante|Nice e Reims|anos 1950 e 1960
Johan Cruyff|Holanda|atacante|Ajax e Barcelona|anos 1960 e 1970
Marco van Basten|Holanda|atacante|Ajax e Milan|anos 1980 e 1990
Ruud Gullit|Holanda|meio-campista|PSV, Milan e Chelsea|anos 1980 e 1990
Frank Rijkaard|Holanda|meio-campista|Ajax e Milan|anos 1980 e 1990
Dennis Bergkamp|Holanda|atacante|Ajax, Inter e Arsenal|anos 1990 e 2000
Arjen Robben|Holanda|ponta|Chelsea, Real Madrid e Bayern|anos 2000 e 2010
Wesley Sneijder|Holanda|meio-campista|Ajax, Real Madrid, Inter e Galatasaray|anos 2000 e 2010
Robin van Persie|Holanda|atacante|Feyenoord, Arsenal e Manchester United|anos 2000 e 2010
Edwin van der Sar|Holanda|goleiro|Ajax, Juventus, Fulham e Manchester United|anos 1990 a 2010
Virgil van Dijk|Holanda|zagueiro|Celtic, Southampton e Liverpool|anos 2010 e 2020
Frenkie de Jong|Holanda|meio-campista|Ajax e Barcelona|anos 2010 e 2020
Memphis Depay|Holanda|atacante|PSV, Manchester United, Lyon e Barcelona|anos 2010 e 2020
Ruud van Nistelrooy|Holanda|atacante|PSV, Manchester United e Real Madrid|anos 1990 e 2000
Franz Beckenbauer|Alemanha|zagueiro|Bayern e New York Cosmos|anos 1960 e 1970
Gerd Müller|Alemanha|atacante|Bayern|anos 1960 e 1970
Lothar Matthäus|Alemanha|meio-campista|Borussia Mönchengladbach, Bayern e Inter|anos 1970 a 2000
Miroslav Klose|Alemanha|atacante|Werder Bremen, Bayern e Lazio|anos 2000 e 2010
Manuel Neuer|Alemanha|goleiro|Schalke e Bayern|anos 2000 a 2020
Philipp Lahm|Alemanha|lateral|Bayern|anos 2000 e 2010
Bastian Schweinsteiger|Alemanha|meio-campista|Bayern e Manchester United|anos 2000 e 2010
Thomas Müller|Alemanha|atacante|Bayern|anos 2000 a 2020
Toni Kroos|Alemanha|meio-campista|Bayern e Real Madrid|anos 2000 a 2020
Mesut Özil|Alemanha|meio-campista|Werder Bremen, Real Madrid e Arsenal|anos 2000 e 2010
Michael Ballack|Alemanha|meio-campista|Bayer Leverkusen, Bayern e Chelsea|anos 1990 e 2000
Oliver Kahn|Alemanha|goleiro|Karlsruher e Bayern|anos 1980 a 2000
Jürgen Klinsmann|Alemanha|atacante|Stuttgart, Inter, Monaco, Tottenham e Bayern|anos 1980 e 1990
Kai Havertz|Alemanha|atacante|Bayer Leverkusen, Chelsea e Arsenal|anos 2010 e 2020
Jamal Musiala|Alemanha|meio-campista|Bayern|anos 2020
Andrés Iniesta|Espanha|meio-campista|Barcelona e Vissel Kobe|anos 2000 e 2010
Xavi Hernández|Espanha|meio-campista|Barcelona|anos 1990 a 2010
Iker Casillas|Espanha|goleiro|Real Madrid e Porto|anos 1990 a 2010
Sergio Ramos|Espanha|zagueiro|Sevilla, Real Madrid e PSG|anos 2000 a 2020
David Villa|Espanha|atacante|Valencia, Barcelona e Atlético de Madrid|anos 2000 e 2010
Fernando Torres|Espanha|atacante|Atlético de Madrid, Liverpool e Chelsea|anos 2000 e 2010
Carles Puyol|Espanha|zagueiro|Barcelona|anos 1990 a 2010
Xabi Alonso|Espanha|meio-campista|Real Sociedad, Liverpool, Real Madrid e Bayern|anos 2000 e 2010
Sergio Busquets|Espanha|meio-campista|Barcelona e Inter Miami|anos 2000 a 2020
David Silva|Espanha|meio-campista|Valencia, Manchester City e Real Sociedad|anos 2000 a 2020
Cesc Fàbregas|Espanha|meio-campista|Arsenal, Barcelona e Chelsea|anos 2000 e 2010
Raúl González|Espanha|atacante|Real Madrid e Schalke|anos 1990 e 2000
Gerard Piqué|Espanha|zagueiro|Manchester United e Barcelona|anos 2000 a 2020
Rodri|Espanha|meio-campista|Villarreal, Atlético de Madrid e Manchester City|anos 2010 e 2020
Pedri|Espanha|meio-campista|Las Palmas e Barcelona|anos 2020
Gavi|Espanha|meio-campista|Barcelona|anos 2020
Gianluigi Buffon|Itália|goleiro|Parma, Juventus e PSG|anos 1990 a 2020
Paolo Maldini|Itália|zagueiro|Milan|anos 1980 a 2000
Franco Baresi|Itália|zagueiro|Milan|anos 1970 a 1990
Fabio Cannavaro|Itália|zagueiro|Parma, Inter, Juventus e Real Madrid|anos 1990 e 2000
Andrea Pirlo|Itália|meio-campista|Inter, Milan e Juventus|anos 1990 a 2010
Francesco Totti|Itália|atacante|Roma|anos 1990 a 2010
Alessandro Del Piero|Itália|atacante|Juventus|anos 1990 a 2010
Roberto Baggio|Itália|atacante|Fiorentina, Juventus, Milan e Inter|anos 1980 a 2000
Gennaro Gattuso|Itália|meio-campista|Rangers e Milan|anos 1990 e 2000
Alessandro Nesta|Itália|zagueiro|Lazio e Milan|anos 1990 a 2010
Giorgio Chiellini|Itália|zagueiro|Fiorentina e Juventus|anos 2000 a 2020
Filippo Inzaghi|Itália|atacante|Atalanta, Juventus e Milan|anos 1990 a 2010
Christian Vieri|Itália|atacante|Juventus, Atlético de Madrid, Lazio e Inter|anos 1990 e 2000
Marco Materazzi|Itália|zagueiro|Perugia e Inter|anos 1990 a 2010
Gianfranco Zola|Itália|atacante|Napoli, Parma e Chelsea|anos 1980 a 2000
Federico Chiesa|Itália|ponta|Fiorentina e Juventus|anos 2010 e 2020
Harry Kane|Inglaterra|atacante|Tottenham e Bayern|anos 2010 e 2020
Wayne Rooney|Inglaterra|atacante|Everton e Manchester United|anos 2000 e 2010
David Beckham|Inglaterra|meio-campista|Manchester United, Real Madrid, Milan e LA Galaxy|anos 1990 e 2000
Steven Gerrard|Inglaterra|meio-campista|Liverpool|anos 1990 a 2010
Frank Lampard|Inglaterra|meio-campista|West Ham, Chelsea e Manchester City|anos 1990 a 2010
Paul Scholes|Inglaterra|meio-campista|Manchester United|anos 1990 a 2010
John Terry|Inglaterra|zagueiro|Chelsea|anos 1990 a 2010
Rio Ferdinand|Inglaterra|zagueiro|West Ham, Leeds e Manchester United|anos 1990 a 2010
Michael Owen|Inglaterra|atacante|Liverpool, Real Madrid e Newcastle|anos 1990 e 2000
Alan Shearer|Inglaterra|atacante|Blackburn e Newcastle|anos 1980 a 2000
Gary Lineker|Inglaterra|atacante|Leicester, Everton, Barcelona e Tottenham|anos 1970 a 1990
Jude Bellingham|Inglaterra|meio-campista|Birmingham, Borussia Dortmund e Real Madrid|anos 2020
Bukayo Saka|Inglaterra|ponta|Arsenal|anos 2010 e 2020
Phil Foden|Inglaterra|meio-campista|Manchester City|anos 2010 e 2020
Marcus Rashford|Inglaterra|atacante|Manchester United|anos 2010 e 2020
Bobby Charlton|Inglaterra|meio-campista|Manchester United|anos 1950 a 1970
George Best|Irlanda do Norte|ponta|Manchester United|anos 1960 e 1970
Kevin De Bruyne|Bélgica|meio-campista|Chelsea, Wolfsburg e Manchester City|anos 2010 e 2020
Eden Hazard|Bélgica|ponta|Lille, Chelsea e Real Madrid|anos 2000 a 2020
Thibaut Courtois|Bélgica|goleiro|Genk, Atlético de Madrid, Chelsea e Real Madrid|anos 2010 e 2020
Romelu Lukaku|Bélgica|atacante|Chelsea, Everton, Manchester United e Inter|anos 2010 e 2020
Vincent Kompany|Bélgica|zagueiro|Hamburgo e Manchester City|anos 2000 e 2010
Dries Mertens|Bélgica|atacante|PSV, Napoli e Galatasaray|anos 2000 a 2020
Luka Modrić|Croácia|meio-campista|Dinamo Zagreb, Tottenham e Real Madrid|anos 2000 a 2020
Ivan Rakitić|Croácia|meio-campista|Schalke, Sevilla e Barcelona|anos 2000 a 2020
Davor Šuker|Croácia|atacante|Sevilla, Real Madrid e Arsenal|anos 1980 a 2000
Ivan Perišić|Croácia|ponta|Borussia Dortmund, Wolfsburg, Inter e Tottenham|anos 2010 e 2020
Robert Lewandowski|Polônia|atacante|Borussia Dortmund, Bayern e Barcelona|anos 2000 a 2020
Wojciech Szczęsny|Polônia|goleiro|Arsenal, Roma e Juventus|anos 2000 a 2020
Pavel Nedvěd|República Tcheca|meio-campista|Sparta Praga, Lazio e Juventus|anos 1990 e 2000
Petr Čech|República Tcheca|goleiro|Rennes, Chelsea e Arsenal|anos 2000 e 2010
Tomáš Rosický|República Tcheca|meio-campista|Sparta Praga, Borussia Dortmund e Arsenal|anos 1990 a 2010
Ferenc Puskás|Hungria|atacante|Honvéd e Real Madrid|anos 1940 a 1960
Hristo Stoichkov|Bulgária|atacante|CSKA Sofia e Barcelona|anos 1980 e 1990
Gheorghe Hagi|Romênia|meio-campista|Steaua, Real Madrid, Barcelona e Galatasaray|anos 1980 e 1990
Andriy Shevchenko|Ucrânia|atacante|Dínamo de Kiev, Milan e Chelsea|anos 1990 e 2000
Oleksandr Zinchenko|Ucrânia|lateral|Manchester City e Arsenal|anos 2010 e 2020
Lev Yashin|União Soviética|goleiro|Dínamo de Moscou|anos 1950 e 1960
George Weah|Libéria|atacante|Monaco, PSG, Milan e Chelsea|anos 1980 a 2000
Didier Drogba|Costa do Marfim|atacante|Marseille, Chelsea e Galatasaray|anos 2000 e 2010
Yaya Touré|Costa do Marfim|meio-campista|Monaco, Barcelona e Manchester City|anos 2000 e 2010
Samuel Eto'o|Camarões|atacante|Mallorca, Barcelona, Inter e Chelsea|anos 1990 a 2010
Roger Milla|Camarões|atacante|Monaco e Montpellier|anos 1970 a 1990
Mohamed Salah|Egito|ponta|Basel, Chelsea, Roma e Liverpool|anos 2010 e 2020
Riyad Mahrez|Argélia|ponta|Leicester e Manchester City|anos 2010 e 2020
Sadio Mané|Senegal|ponta|Southampton, Liverpool e Bayern|anos 2010 e 2020
Kalidou Koulibaly|Senegal|zagueiro|Genk, Napoli e Chelsea|anos 2010 e 2020
Michael Essien|Gana|meio-campista|Lyon, Chelsea e Real Madrid|anos 2000 e 2010
Abedi Pelé|Gana|meio-campista|Marseille|anos 1980 e 1990
Jay-Jay Okocha|Nigéria|meio-campista|Eintracht Frankfurt, PSG e Bolton|anos 1990 e 2000
Nwankwo Kanu|Nigéria|atacante|Ajax, Inter e Arsenal|anos 1990 e 2000
Victor Osimhen|Nigéria|atacante|Lille e Napoli|anos 2010 e 2020
Son Heung-min|Coreia do Sul|atacante|Bayer Leverkusen e Tottenham|anos 2010 e 2020
Park Ji-sung|Coreia do Sul|meio-campista|PSV e Manchester United|anos 2000 e 2010
Hidetoshi Nakata|Japão|meio-campista|Perugia, Roma, Parma e Bolton|anos 1990 e 2000
Keisuke Honda|Japão|meio-campista|CSKA Moscou e Milan|anos 2000 e 2010
Ali Daei|Irã|atacante|Arminia Bielefeld, Bayern e Hertha|anos 1990 e 2000
Tim Cahill|Austrália|meio-campista|Millwall e Everton|anos 1990 a 2010
Tim Howard|Estados Unidos|goleiro|Manchester United e Everton|anos 2000 e 2010
Landon Donovan|Estados Unidos|atacante|Bayer Leverkusen e LA Galaxy|anos 1990 a 2010
Christian Pulisic|Estados Unidos|ponta|Borussia Dortmund, Chelsea e Milan|anos 2010 e 2020
Rafael Márquez|México|zagueiro|Monaco e Barcelona|anos 1990 a 2010
Hugo Sánchez|México|atacante|Atlético de Madrid e Real Madrid|anos 1970 a 1990
Javier Hernández|México|atacante|Manchester United, Real Madrid e Bayer Leverkusen|anos 2000 a 2020
Guillermo Ochoa|México|goleiro|América, Ajaccio e Málaga|anos 2000 a 2020
Keylor Navas|Costa Rica|goleiro|Levante, Real Madrid e PSG|anos 2000 a 2020
Paulo Wanchope|Costa Rica|atacante|Derby, West Ham e Manchester City|anos 1990 e 2000
Alexis Sánchez|Chile|atacante|Udinese, Barcelona, Arsenal e Inter|anos 2000 a 2020
Arturo Vidal|Chile|meio-campista|Bayer Leverkusen, Juventus, Bayern e Barcelona|anos 2000 a 2020
Iván Zamorano|Chile|atacante|Sevilla, Real Madrid e Inter|anos 1980 a 2000
James Rodríguez|Colômbia|meio-campista|Porto, Monaco, Real Madrid e Bayern|anos 2000 a 2020
Radamel Falcao|Colômbia|atacante|Porto, Atlético de Madrid, Monaco e Chelsea|anos 2000 a 2020
Carlos Valderrama|Colômbia|meio-campista|Montpellier e Valladolid|anos 1980 e 1990
René Higuita|Colômbia|goleiro|Atlético Nacional e Valladolid|anos 1980 e 1990
Juan Cuadrado|Colômbia|lateral|Fiorentina, Chelsea e Juventus|anos 2000 a 2020
Faustino Asprilla|Colômbia|atacante|Parma e Newcastle|anos 1980 e 1990
Enner Valencia|Equador|atacante|Pachuca, West Ham e Fenerbahçe|anos 2010 e 2020
Antonio Valencia|Equador|lateral|Wigan e Manchester United|anos 2000 e 2010
Teófilo Cubillas|Peru|meio-campista|Alianza Lima e Porto|anos 1960 a 1980
Claudio Pizarro|Peru|atacante|Werder Bremen, Bayern e Chelsea|anos 1990 a 2010
Roque Santa Cruz|Paraguai|atacante|Bayern, Blackburn e Manchester City|anos 1990 a 2010
José Luis Chilavert|Paraguai|goleiro|Vélez Sarsfield e Strasbourg|anos 1980 a 2000
Gheorghe Popescu|Romênia|zagueiro|PSV, Tottenham e Barcelona|anos 1980 e 1990
Henrik Larsson|Suécia|atacante|Celtic, Barcelona e Manchester United|anos 1990 e 2000
Zlatan Ibrahimović|Suécia|atacante|Ajax, Juventus, Inter, Barcelona, Milan e PSG|anos 1990 a 2020
Freddie Ljungberg|Suécia|meio-campista|Arsenal e West Ham|anos 1990 e 2000
Peter Schmeichel|Dinamarca|goleiro|Manchester United e Sporting|anos 1980 e 1990
Michael Laudrup|Dinamarca|meio-campista|Juventus, Barcelona e Real Madrid|anos 1980 e 1990
Christian Eriksen|Dinamarca|meio-campista|Ajax, Tottenham, Inter e Manchester United|anos 2010 e 2020
Erling Haaland|Noruega|atacante|Salzburg, Borussia Dortmund e Manchester City|anos 2010 e 2020
Martin Ødegaard|Noruega|meio-campista|Real Madrid, Real Sociedad e Arsenal|anos 2010 e 2020
Søren Lerby|Dinamarca|meio-campista|Ajax, Bayern e PSV|anos 1970 a 1990
Jari Litmanen|Finlândia|meio-campista|Ajax, Barcelona e Liverpool|anos 1980 a 2000
Gareth Bale|País de Gales|ponta|Southampton, Tottenham e Real Madrid|anos 2000 a 2020
Ryan Giggs|País de Gales|ponta|Manchester United|anos 1990 a 2010
Ian Rush|País de Gales|atacante|Liverpool e Juventus|anos 1970 a 1990
Kenny Dalglish|Escócia|atacante|Celtic e Liverpool|anos 1960 a 1980
Denis Law|Escócia|atacante|Manchester United|anos 1950 a 1970
Roy Keane|Irlanda|meio-campista|Nottingham Forest e Manchester United|anos 1990 e 2000
Robbie Keane|Irlanda|atacante|Tottenham, Liverpool e LA Galaxy|anos 1990 a 2010
Dimitar Berbatov|Bulgária|atacante|Bayer Leverkusen, Tottenham e Manchester United|anos 1990 a 2010
Dejan Stanković|Sérvia|meio-campista|Lazio e Inter|anos 1990 a 2010
Nemanja Vidić|Sérvia|zagueiro|Spartak Moscou e Manchester United|anos 2000 e 2010
Dušan Vlahović|Sérvia|atacante|Fiorentina e Juventus|anos 2010 e 2020
Edin Džeko|Bósnia|atacante|Wolfsburg, Manchester City, Roma e Inter|anos 2000 a 2020
Safet Sušić|Bósnia|meio-campista|Sarajevo e PSG|anos 1970 a 1990
Mohamed Aboutrika|Egito|meio-campista|Al Ahly|anos 2000 e 2010
Achraf Hakimi|Marrocos|lateral|Real Madrid, Borussia Dortmund, Inter e PSG|anos 2010 e 2020
Hakim Ziyech|Marrocos|meio-campista|Ajax e Chelsea|anos 2010 e 2020
Mustapha Hadji|Marrocos|meio-campista|Deportivo e Coventry|anos 1990 e 2000
Pierre-Emerick Aubameyang|Gabão|atacante|Borussia Dortmund, Arsenal e Barcelona|anos 2000 a 2020
Emmanuel Adebayor|Togo|atacante|Monaco, Arsenal, Manchester City e Real Madrid|anos 2000 e 2010
Benni McCarthy|África do Sul|atacante|Ajax, Porto e Blackburn|anos 1990 e 2000
Lucas Radebe|África do Sul|zagueiro|Kaizer Chiefs e Leeds|anos 1980 a 2000
Bruce Grobbelaar|Zimbábue|goleiro|Liverpool|anos 1970 a 1990
Youssef En-Nesyri|Marrocos|atacante|Leganés e Sevilla|anos 2010 e 2020
Salem Al-Dawsari|Arábia Saudita|ponta|Al Hilal|anos 2010 e 2020
Cha Bum-kun|Coreia do Sul|atacante|Eintracht Frankfurt e Bayer Leverkusen|anos 1970 e 1980
Shunsuke Nakamura|Japão|meio-campista|Reggina, Celtic e Espanyol|anos 1990 a 2010
Maya Yoshida|Japão|zagueiro|Southampton, Sampdoria e Schalke|anos 2000 a 2020
Yuto Nagatomo|Japão|lateral|Cesena, Inter e Galatasaray|anos 2000 a 2020
Mark Viduka|Austrália|atacante|Celtic, Leeds e Newcastle|anos 1990 e 2000
Harry Kewell|Austrália|ponta|Leeds e Liverpool|anos 1990 e 2000
Clint Dempsey|Estados Unidos|atacante|Fulham, Tottenham e Seattle|anos 2000 e 2010
DaMarcus Beasley|Estados Unidos|ponta|PSV, Manchester City e Rangers|anos 2000 e 2010
Brian McBride|Estados Unidos|atacante|Fulham|anos 1990 e 2000
Cuauhtémoc Blanco|México|atacante|América e Valladolid|anos 1990 e 2000
Jorge Campos|México|goleiro|Pumas e LA Galaxy|anos 1980 a 2000
Andrés Guardado|México|meio-campista|Deportivo, Valencia, PSV e Betis|anos 2000 a 2020
Bryan Ruiz|Costa Rica|meio-campista|Twente, Fulham e Sporting|anos 2000 e 2010
Joel Campbell|Costa Rica|atacante|Arsenal, Betis e Olympiacos|anos 2010 e 2020
Salomón Rondón|Venezuela|atacante|Málaga, West Brom e Newcastle|anos 2000 a 2020
Juan Arango|Venezuela|meio-campista|Mallorca e Borussia Mönchengladbach|anos 1990 a 2010
Marcelo Salas|Chile|atacante|River Plate, Lazio e Juventus|anos 1990 e 2000
David Ospina|Colômbia|goleiro|Nice, Arsenal e Napoli|anos 2000 a 2020
Mario Yepes|Colômbia|zagueiro|River Plate, PSG e Milan|anos 1990 a 2010
Jefferson Farfán|Peru|atacante|PSV e Schalke|anos 2000 e 2010
Diego Godín|Uruguai|zagueiro|Villarreal, Atlético de Madrid e Inter|anos 2000 a 2020
José María Giménez|Uruguai|zagueiro|Atlético de Madrid|anos 2010 e 2020
Álvaro Recoba|Uruguai|atacante|Inter e Torino|anos 1990 e 2000
Fernando Muslera|Uruguai|goleiro|Lazio e Galatasaray|anos 2000 a 2020
Mario Kempes|Argentina|atacante|Rosario Central e Valencia|anos 1970 e 1980
Daniel Passarella|Argentina|zagueiro|River Plate, Fiorentina e Inter|anos 1970 e 1980
Ubaldo Fillol|Argentina|goleiro|River Plate e Atlético de Madrid|anos 1960 a 1980
Claudio Caniggia|Argentina|atacante|Atalanta, Roma e Boca Juniors|anos 1980 e 1990
Juan Sebastián Verón|Argentina|meio-campista|Parma, Lazio, Manchester United e Inter|anos 1990 e 2000
Pablo Aimar|Argentina|meio-campista|River Plate, Valencia e Benfica|anos 1990 a 2010
Diego Simeone|Argentina|meio-campista|Atlético de Madrid, Inter e Lazio|anos 1980 a 2000
Mauricio Pochettino|Argentina|zagueiro|Espanyol e PSG|anos 1980 a 2000
Juan Pablo Sorín|Argentina|lateral|River Plate, Cruzeiro, Barcelona e Villarreal|anos 1990 e 2000
Walter Samuel|Argentina|zagueiro|Boca Juniors, Roma, Real Madrid e Inter|anos 1990 a 2010
Esteban Cambiasso|Argentina|meio-campista|Real Madrid e Inter|anos 1990 a 2010
Carlos Tévez|Argentina|atacante|Boca Juniors, Corinthians, Manchester United e Juventus|anos 2000 e 2010
Julián Álvarez|Argentina|atacante|River Plate, Manchester City e Atlético de Madrid|anos 2020
Alexis Mac Allister|Argentina|meio-campista|Brighton e Liverpool|anos 2010 e 2020
`;

function normalize(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

const profiles = PLAYER_ROWS.trim().split("\n").map((row, index) => {
  const [answer, country, position, clubs, era] = row.split("|");
  return { id: index + 1, answer, country, position, clubs, era };
});

const QUESTIONS = profiles.flatMap((p) => {
  const initials = p.answer.split(/\s+/).map((part) => part[0]).join(".").toUpperCase();
  const aliases = [normalize(p.answer), normalize(p.answer.split(" ").pop())];
  const firstClub = p.clubs.split(/,| e /)[0].trim();
  const templates = [
    [
      `A carreira deste nome ficou marcada nos ${p.era}.`,
      `Defendeu as cores de ${p.country} no futebol internacional.`,
      `Sua função mais conhecida em campo era ${p.position}.`,
      `No futebol de clubes, vestiu camisas como ${p.clubs}.`,
      `Uma pista decisiva: passou por ${firstClub} e suas iniciais são ${initials}.`
    ],
    [
      `Entre os clubes ligados à sua trajetória estão ${p.clubs}.`,
      `É um nome associado à geração dos ${p.era}.`,
      `Quando representava sua seleção, jogava por ${p.country}.`,
      `Dentro de campo, destacou-se principalmente como ${p.position}.`,
      `Para fechar: sua trajetória inclui ${firstClub}, e o nome tem as iniciais ${initials}.`
    ],
    [
      `Sua história no futebol passa por ${firstClub}.`,
      `Viveu seus anos de maior destaque nos ${p.era}.`,
      `Atuava sobretudo na posição de ${p.position}.`,
      `No cenário de seleções, representou ${p.country}.`,
      `Também jogou por ${p.clubs}; as iniciais do nome são ${initials}.`
    ],
    [
      `Este jogador pertence à geração que brilhou nos ${p.era}.`,
      `A posição pela qual ficou conhecido é ${p.position}.`,
      `Sua carreira internacional está ligada a ${p.country}.`,
      `O currículo de clubes inclui ${p.clubs}.`,
      `Último empurrão: um dos clubes foi ${firstClub}, e suas iniciais são ${initials}.`
    ]
  ];
  return [
    {
      id: `${p.id}-a`, answer: p.answer, aliases,
      hints: templates[(p.id - 1) % templates.length]
    },
    {
      id: `${p.id}-b`, answer: p.answer, aliases,
      hints: templates[(p.id + 1) % templates.length]
    }
  ];
}).slice(0, 500);

module.exports = { QUESTIONS, normalize };
