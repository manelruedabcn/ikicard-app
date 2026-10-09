import type { Grupo, Patron } from './paso-content'

// Contenido de PASO en catalán. Los ids, dimensiones y códigos de perfil
// coinciden deliberadamente con el dataset español: el idioma nunca cambia
// la puntuación ni el perfil final.
const GROUP_ROWS: [string, string, string, string][] = [
  ['Prenc decisions amb facilitat', 'Connecto fàcilment amb la gent', 'Em prenc les coses amb calma', 'Actuo amb precaució'],
  ['Sostinc el que penso', 'Tracto els altres amb proximitat', 'Espero sense impacientar-me', "M'ho penso amb calma"],
  ['Vaig de front', "M'obro als altres", 'Mantinc un ritme constant', 'Cuido el detall'],
  ["M'atreveixo amb el que és difícil", 'Connecto amb facilitat', 'Mantinc la calma davant dels canvis', 'Presto atenció als detalls'],
  ['Porto les coses fins al final', 'Expresso obertament el que penso', 'Em quedo al costat de qui compta amb mi', 'Faig les coses amb rigor'],
  ['No em rendeixo', 'Miro el costat bo', 'Mantinc la calma', 'Vaig amb prudència'],
  ["M'exigeixo per assolir els meus objectius", 'Sovint convenço els altres', "No m'altero fàcilment", 'Ho reviso abans de donar-ho per bo'],
  ['Me les arreglo pel meu compte', "M'entusiasmo amb facilitat", 'Actuo amb discreció', "Prefereixo observar abans d'obrir-me"],
  ['Assumeixo riscos quan cal', 'Expresso el que sento', 'Mantinc els meus compromisos amb els altres', 'Segueixo un procés pas a pas'],
  ['Actuo sense donar-hi massa voltes', 'Faig les coses amb alegria', 'Em sento bé sense ser protagonista', 'Analitzo les coses a fons'],
  ['Actuo amb rapidesa', 'Em relaciono amb facilitat', 'Actuo amb constància', 'Actuo amb cautela'],
  ['Insisteixo fins a aconseguir-ho', 'Creo proximitat amb facilitat', 'Escolto amb paciència', 'Faig les coses de manera ordenada'],
  ['Poso energia en el que faig', 'Transmeto entusiasme als altres', 'Mantinc la meva paraula', 'Comparo opcions abans de triar'],
  ['Em proposo metes ambicioses', "M'uneixo amb entusiasme als plans", 'Mantinc un ritme tranquil', 'Busco precisió en el que faig'],
  ['Afronto les coses amb decisió', 'Em mostro tal com soc', 'Evito presumir del que faig', 'Em reservo part del que penso'],
  ['Prenc les meves pròpies decisions', "M'expresso amb soltesa", 'Busco que els altres estiguin a gust', 'Segueixo un sistema definit'],
  ['Prenc decisions amb rapidesa', 'Animo els altres', "Mantinc l'esforç amb el temps", 'Faig les coses amb cura'],
  ['Em centro a aconseguir resultats', 'Genero un ambient agradable', 'Em dono temps per fer les coses', 'Reflexiono abans de decidir'],
  ['Prenc la iniciativa', 'Deixo veure el que sento', "Mantinc una manera estable d'actuar", "Calculo abans d'actuar"],
  ['Prenc el comandament quan cal', 'Connecto amb persones diferents', 'Busco un punt mitjà', 'Ho reviso per evitar errors'],
  ['Dic les coses amb claredat', "M'expresso amb proximitat", 'Actuo amb confiança', 'Aplico el mateix criteri a tothom'],
  ['Faig el primer pas', 'Faig que els altres se sentin en confiança', 'Mantinc un ritme estable', 'Respecto els acords i les normes'],
  ['Actuo amb determinació', 'Em guanyo la confiança de la gent', 'Actuo amb humilitat', 'Faig les coses amb compte'],
  ['No em deixo intimidar', 'Faig bona lliga amb facilitat', 'Mantinc la calma sota pressió', 'Em reservo els meus assumptes personals'],
  ['Expresso el que penso amb franquesa', 'Tracto els altres amb amabilitat', 'Ajudo quan cal', 'Reflexiono sobre el que sento'],
  ['Resolc les coses amb autonomia', "Trobo la manera d'arribar a la gent", 'Avanço sense presses', 'Cuido els detalls fins al final'],
  ['Afronto les coses amb energia', 'Transmeto bon humor', 'Estic pendent dels altres', "M'asseguro que les coses quedin bé"],
  ['Segueixo endavant tot i les dificultats', 'Inspiro els altres', 'Espero amb paciència', 'Considero diferents punts de vista abans de decidir'],
]

export const PASO_GROUPS_CA: Grupo[] = GROUP_ROWS.map((row, index) => ({
  grupo: index + 1,
  P: row[0],
  A: row[1],
  S: row[2],
  O: row[3],
}))

export const PASO_PATTERNS_CA: Patron[] = [
  {
    codigo: 'PPPP',
    nombre: 'Caminant Frontal',
    retrato:
      "Camines de front, sense embuts. On els altres encara miren el mapa, tu ja has fet el primer pas: per a tu moure's és la prova que la vida avança. La teva força és que res no et frena; el teu repte, recordar que no tots els trams es guanyen per velocitat, alguns demanen presència.",
    motivacion:
      'Arribar, resoldre, tenir alguna cosa per mostrar al final del dia. El moviment mateix és la prova que la vida avança.',
    bajo_presion:
      'Et tornes més tallant, no més lent. Decideixes de pressa i exigeixes que els altres segueixin el ritme.',
    teme:
      'La irrellevància. Quedar-te sense avançar, sense res per conquerir, et pesa més que qualsevol fracàs.',
    seria_mas_eficaz_si:
      'Acceptessis que alguns trams del camí no demanen velocitat, demanen presència.',
    libro_recomendado: 'El Ikigai que no te contaron',
  },
  {
    codigo: 'AAAA',
    nombre: 'Caminant en Companyia',
    retrato:
      "Camines cap a la gent. Els passos se't fan diferents quan hi ha algú al costat amb qui compartir-los, i la teva energia creix amb la del grup. El teu do és unir la gent; el teu aprenentatge, descobrir que els trams en solitud també són teus i també et sostenen.",
    motivacion:
      'Que el camí es comparteixi. Un èxit sense ningú que el celebri gairebé no compta com a èxit.',
    bajo_presion:
      "Dispersiones energia en conversa i validació, i de vegades confons parlar del problema amb resoldre'l.",
    teme: 'El camí silenciós, sense testimonis ni reconeixement.',
    seria_mas_eficaz_si:
      "T'entrenessis a sostenir trams en solitud, sense que això signifiqui perdre el rumb.",
    libro_recomendado: 'Camina sin separarte de ti',
  },
  {
    codigo: 'SSSS',
    nombre: 'Caminant que Sosté',
    retrato:
      'Camines a pas constant, sense sotragades ni presses. El teu terreny és la fiabilitat: els altres saben que hi seràs, demà i demà passat, amb el mateix ritme ferm. La teva força és la constància; el teu repte, atrevir-te a accelerar quan el moment de debò ho demana.',
    motivacion: "Un pas constant, sense sotragades. La fiabilitat és la teva forma d'excel·lència.",
    bajo_presion:
      'Et replegues i busques que tot torni de seguida al curs conegut; el canvi brusc et costa més que l’esforç.',
    teme: "Que t'obliguin a canviar de ruta sense avís.",
    seria_mas_eficaz_si:
      'Et permetessis accelerar quan el moment realment ho demana, en lloc de protegir el ritme per sistema.',
    libro_recomendado: 'Disciplina para indisciplinados',
  },
  {
    codigo: 'OOOO',
    nombre: 'Caminant que Observa',
    retrato:
      'Abans de trepitjar, mires. Estudies el terreny, calcules la ruta i només llavors avances, perquè per a tu un pas ben pensat val per deu fets a cegues. El teu do és la lucidesa; la teva trampa, creure que el mapa pot estar complet abans de caminar.',
    motivacion:
      'Entendre el terreny abans de trepitjar-lo. Un pas ben calculat val més que deu fets a cegues.',
    bajo_presion:
      "Et replegues cap a l'anàlisi i ho revises una vegada més abans de decidir; el risc és que la revisió no s'acabi mai.",
    teme: "Equivocar-te per no haver mirat bé.",
    seria_mas_eficaz_si:
      'Acceptessis que cap mapa no està complet abans de caminar, i que part del terreny només es coneix trepitjant-lo.',
    libro_recomendado: 'No todo lo que te frena es tuyo',
  },
  {
    codigo: 'PA',
    nombre: 'Caminant que Arrossega',
    retrato:
      "Avançes de pressa i sols arrossegar altres amb el teu impuls: poques vegades camines del tot en solitud. Necessites tant arribar com que es noti fins on has arribat. La teva força mou grups sencers; el teu repte, mirar enrere i preguntar abans d'arrossegar.",
    motivacion:
      "Moure't de pressa i portar altres amb tu. Necessites tant el resultat com l'aplaudiment que l'acompanya.",
    bajo_presion:
      "Imposes el ritme sense demanar permís, i pots passar per sobre sense adonar-te'n de qui camina més a poc a poc.",
    teme: 'Que el grup avanci sense el teu impuls, o que ningú no noti fins on has arribat.',
    seria_mas_eficaz_si:
      "Aprenguessis a preguntar abans d'arrossegar, i a celebrar el pas dels altres sense necessitar ser el protagonista.",
    libro_recomendado: 'El Ikigai que no te contaron',
  },
  {
    codigo: 'PO',
    nombre: 'Caminant que Calcula',
    retrato:
      "Avançes, sí, però només quan entens el terreny. Primer analitzes i després decideixes de pressa, sense dubtar. El teu do és unir cap i acció; la teva trampa, exigir una anàlisi perfecta que no acaba d'arribar mai.",
    motivacion:
      'Avançar, però només després d’haver entès el terreny. Decideixes de pressa un cop has analitzat.',
    bajo_presion:
      "Et tornes distant i tallant, prioritzant l'eficàcia per sobre de qualsevol consideració que la freni.",
    teme: "Actuar sobre informació incompleta i que l'error sigui evident per a tothom.",
    seria_mas_eficaz_si:
      "Acceptessis que l'anàlisi perfecta no existeix, i que part de caminar és tolerar la incertesa.",
    libro_recomendado: 'No todo lo que te frena es tuyo',
  },
  {
    codigo: 'AS',
    nombre: 'Caminant que Acull',
    retrato:
      "Camines pendent que ningú no es quedi enrere. El ritme el marca qui va més a poc a poc, perquè tendeixes a sentir que el camí sap millor si es recorre en companyia i amb calma. El teu do és acollir; el teu aprenentatge, entendre que sostenir algú no sempre és complaure'l.",
    motivacion:
      'Que ningú no es quedi enrere. El camí només té sentit si es recorre en bona companyia i sense presses.',
    bajo_presion:
      'Evites el conflicte a tota costa, fins i tot quan dir una cosa incòmoda seria el més útil.',
    teme: "Trencar l'harmonia del grup, encara que això signifiqui callar una cosa important.",
    seria_mas_eficaz_si: 'Entenguessis que sostenir no sempre significa complaure.',
    libro_recomendado: 'Camina sin separarte de ti',
  },
  {
    codigo: 'SO',
    nombre: 'Caminant del Mètode',
    retrato:
      "Confies en el procés més que en l'impuls. Un camí clar, sense dreceres ni sorpreses, és el teu terreny segur. La teva força és l'ordre; el teu repte, improvisar quan el mapa ja no descriu el que estàs trepitjant.",
    motivacion:
      "Un procés clar, sense sorpreses ni dreceres. Confies en el sistema més que en l'impuls.",
    bajo_presion:
      "T'aferres al procediment fins i tot quan la situació demana flexibilitat.",
    teme: 'El caos, el canvi sense una estructura prèvia que el sostingui.',
    seria_mas_eficaz_si:
      'Et permetessis improvisar quan el mapa ja no descriu el terreny real.',
    libro_recomendado: 'Disciplina para indisciplinados',
  },
  {
    codigo: 'PS',
    nombre: 'Caminant que no es Desvia',
    retrato:
      'Quan tries una direcció, la sostens costi el que costi. La teva determinació no es mesura en velocitat, sinó en què no et desvies. La teva força és aquesta persistència; la teva trampa, confondre sostenir el rumb amb negar-te a mirar el mapa de nou.',
    motivacion:
      'Arribar a la meta sense desviar-te, costi el que costi. La determinació és la teva força, no la velocitat.',
    bajo_presion:
      'Et tanques en una sola direcció i et costa reconsiderar, encara que el terreny hagi canviat.',
    teme: 'Haver invertit esforç en un camí equivocat i haver-ho de reconèixer.',
    seria_mas_eficaz_si:
      'Distingissis entre perseverança i obstinació: no és el mateix sostenir el rumb que negar-te a mirar el mapa de nou.',
    libro_recomendado: 'Disciplina para indisciplinados',
  },
  {
    codigo: 'AO',
    nombre: 'Caminant que Observa en Companyia',
    retrato:
      "Mires les persones abans que el terreny. Escoltes, observes i processes en silenci abans d'opinar, perquè entendre qui tens al costat és la teva brúixola. El teu do és la lectura fina; el teu repte, atrevir-te a compartir el que veus encara que no estigui del tot verificat.",
    motivacion:
      "Entendre profundament qui t'envolta, més que el terreny mateix. Escoltes abans d'opinar.",
    bajo_presion:
      'Et retraus, processes en silenci, i pots semblar distant just quan més et necessiten a prop.',
    teme: "Malinterpretar algú important, o que et malinterpretin sense oportunitat d'explicar-te.",
    seria_mas_eficaz_si:
      'Confessis a compartir una primera impressió, encara que no estigui encara del tot verificada.',
    libro_recomendado: 'Camina sin separarte de ti',
  },
  {
    codigo: 'PAO',
    nombre: 'Caminant Estratega',
    retrato:
      "Avançes amb altres, però per una ruta que ja has estudiat. Combines impuls, relació i càlcul gairebé a parts iguals, i sols prendre el comandament amb un pla sota el braç. El teu do és dirigir amb criteri; el teu repte, deixar lloc al pla que no és el teu.",
    motivacion:
      'Avançar amb altres, però només per una ruta ja estudiada. Combines impuls, relació i càlcul a parts iguals.',
    bajo_presion:
      'Prens el comandament del grup amb un pla ja traçat, encara que no sempre ho consultis abans.',
    teme: 'Que el grup es dispersi per falta de direcció clara.',
    seria_mas_eficaz_si:
      "Deixessis espai per al pla que no és el teu, i confiessis que el grup també sap llegir el terreny.",
    libro_recomendado: 'El Ikigai que no te contaron',
  },
  {
    codigo: 'ASO',
    nombre: 'Caminant que Cuida el Procés',
    retrato:
      'Camines perquè el grup arribi sencer, amb cada pas ben fet i sense forçar ningú a córrer. Cuides el ritme i el procés per igual. El teu do és que ningú no es perdi pel camí; el teu aprenentatge, veure que de vegades cuidar bé també significa avançar.',
    motivacion:
      'Que el grup arribi sencer, amb cada pas ben fet i sense forçar ningú a córrer.',
    bajo_presion:
      'Alenteixes encara més per no deixar ningú enrere, fins i tot quan la situació demana avançar.',
    teme: 'Que la teva cura es confongui amb lentitud, o que algú se senti al marge del camí.',
    seria_mas_eficaz_si:
      'Acceptessis que de vegades cuidar bé també significa avançar, no només esperar.',
    libro_recomendado: 'No todo lo que te frena es tuyo',
  },
  {
    codigo: 'PAS',
    nombre: 'Caminant Motor',
    retrato:
      "Mantens el grup en marxa: empenys amb energia, proximitat i ritme, sense frenar però sense cremar ningú. Decideixes sobre la marxa i ja ho revisaràs després. La teva força és sostenir el moviment; el teu repte, aturar-te a pensar abans d'empènyer, no després.",
    motivacion:
      'Que el grup avanci de manera constant, sense frenar però sense cremar ningú. Combines impuls, proximitat i ritme sostingut.',
    bajo_presion:
      "Empenys amb energia però et guardes l'anàlisi per després: decideixes i ja ho revisaràs sobre la marxa.",
    teme: 'Que el grup perdi la cohesió per anar massa de pressa, o el ritme per aturar-te a pensar massa.',
    seria_mas_eficaz_si:
      "T'aturessis abans d'empènyer, no després: la pressa per mantenir unit el grup de vegades t'impedeix veure que el rumb no és el correcte.",
    libro_recomendado: 'Camina sin separarte de ti',
  },
  {
    codigo: 'PSO',
    nombre: 'Caminant de Pas Ferm',
    retrato:
      'Avançes amb pas ferm, sense presses però sense pauses, i sempre sobre terreny ja comprovat. El teu mètode és la teva roca. La teva força és aquesta solidesa; la teva trampa, tornar-te inflexible just quan el propi mètode demana canviar.',
    motivacion:
      'Avançar amb pas ferm, sense presses però sense pauses, i sempre sobre terreny ja comprovat.',
    bajo_presion:
      'Et tornes inflexible: confies tant en el teu mètode que et costa admetre que potser cal canviar-lo.',
    teme: "L'error per descuit, i també el caos que trencaria el teu sistema d'avanç.",
    seria_mas_eficaz_si:
      "Acceptessis petites dosis d'improvisació com a part legítima del camí, no com a fallada del pla.",
    libro_recomendado: 'Disciplina para indisciplinados',
  },
  {
    codigo: 'PASO',
    nombre: 'Caminant en Equilibri',
    retrato:
      "Cap eix mana per sobre dels altres: decideixes, acompanyes, sostens i observes segons ho demani cada moment. No tens un mode per defecte, els tens tots disponibles. El teu do és la versatilitat; el teu repte, confiar que aquesta adaptabilitat ja és una força, no una cosa a compensar.",
    motivacion:
      'Cap eix domina amb claredat sobre els altres: decideixes, acompanyes, sostens i observes segons ho demani cada moment, no segons un patró fix.',
    bajo_presion:
      "Respons amb l'energia que necessita la situació, encara que pots dubtar uns instants de més en no tenir un mode per defecte clar.",
    teme: "Perdre aquesta capacitat d'adaptar-te i caure en un sol mode de caminar.",
    seria_mas_eficaz_si:
      'Confessis que aquesta versatilitat ja és una força en si mateixa, i no una cosa a compensar per no tenir un tipus definit.',
    libro_recomendado:
      'Sense un que destaqui especialment: és el perfil que més es beneficia de veure el mètode complet',
  },
]
