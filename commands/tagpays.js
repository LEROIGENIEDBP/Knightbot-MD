// tagpays.js - Plugin Knight Bot pour taguer les membres par pays
// Auteur: Assistant AI | Compatible avec Knight Bot-MD
// Usage: !tagpays BF | !tagpays Burkina Faso
// Restriction: Administrateurs uniquement

const { getBotNumber } = require('../lib/database');

module.exports = {
  config: {
    name: 'tagpays',
    aliases: ['tagp', 'tp', 'tagcountry'],
    category: 'admin',
    description: 'Taguer les membres selon leur indicatif téléphonique par pays',
    usage: 'tagpays <pays>',
    cooldown: 5
  },
  
  run: async (knight, message, args) => {
    try {
      const { from, sender, isGroup, reply, isAdmin, isBotAdmin } = message;
      
      // Vérification groupe
      if (!isGroup) {
        return reply('⚠️ Cette commande fonctionne uniquement dans les groupes.');
      }
      
      // Vérification admin
      if (!isAdmin) {
        return reply('❌ Cette commande est réservée aux administrateurs du groupe.');
      }
      
      // Vérification bot admin
      if (!isBotAdmin) {
        return reply('❌ Le bot doit être administrateur pour utiliser cette commande.');
      }
      
      // Vérification arguments
      if (!args[0]) {
        return reply(`📍 *Utilisation:* !tagpays <pays>

*Exemples:*
• !tagpays BF
• !tagpays Burkina Faso  
• !tagpays France
• !tagpays CI

*Quelques codes pays populaires:*
🇧🇫 BF - Burkina Faso
🇨🇮 CI - Côte d'Ivoire  
🇸🇳 SN - Sénégal
🇫🇷 FR - France
🇲🇱 ML - Mali
🇲🇦 MA - Maroc
🇩🇿 DZ - Algérie
🇹🇳 TN - Tunisie

⚠️ *Restriction:* Commande réservée aux administrateurs`);
      }

      const query = args.join(' ').toUpperCase();
      
      // Recherche du pays avec normalisation
      const matchKey = Object.keys(countryCodes).find(k => {
        const countryData = countryCodes[k];
        return k === query || 
               countryData.name.toUpperCase() === query ||
               countryData.name.toUpperCase().includes(query) ||
               query.includes(countryData.name.toUpperCase());
      });

      if (!matchKey) {
        return reply(`❌ Pays non reconnu: "${args.join(' ')}"

*Exemples valides:*
• BF ou Burkina Faso
• CI ou Côte d'Ivoire  
• SN ou Sénégal
• FR ou France
• MA ou Maroc

Tapez !tagpays pour voir plus d'exemples.`);
      }

      const indicatif = countryCodes[matchKey].code;
      const countryName = countryCodes[matchKey].name;
      const flagEmoji = getCountryFlag(matchKey);

      // Récupération des participants du groupe
      const groupMetadata = await knight.groupMetadata(from);
      const groupParticipants = groupMetadata.participants;

      // Filtrer les participants par indicatif
      const matches = groupParticipants.filter(p => {
        const phoneNumber = p.id.replace('@s.whatsapp.net', '');
        const cleanIndicatif = indicatif.replace('+', '');
        return phoneNumber.startsWith(cleanIndicatif);
      });

      if (!matches.length) {
        return reply(`${flagEmoji} *${countryName}*

❌ Aucun membre du groupe n'a un numéro de ${countryName} (${indicatif})

*Membres recherchés:* Numéros commençant par ${indicatif}

_Commande exécutée par un administrateur_`);
      }

      // Préparer les mentions
      const mentions = matches.map(p => p.id);
      const membersList = matches.map((p, index) => {
        const phoneNumber = p.id.replace('@s.whatsapp.net', '');
        return `${index + 1}. @${phoneNumber}`;
      }).join('\n');

      // Message de tag
      const tagMessage = `${flagEmoji} *Membres de ${countryName}* (${indicatif})
*Total trouvé:* ${matches.length} membre(s)

${membersList}

👑 _Commande exécutée par un administrateur_
🤖 _Plugin tagpays - Knight Bot-MD_`;

      // Envoyer le message avec mentions
      await knight.sendMessage(from, {
        text: tagMessage,
        mentions: mentions
      });

      // Log pour debug
      console.log(`[TAGPAYS] Admin ${sender} a tagué ${matches.length} membres de ${countryName} dans le groupe ${from}`);

    } catch (error) {
      console.error('Erreur tagpays:', error);
      reply('❌ Une erreur s\'est produite lors de l\'exécution de la commande.');
    }
  }
};

// Fonction pour obtenir le drapeau du pays
function getCountryFlag(countryCode) {
  const flags = {
    // Afrique
    DZ: '🇩🇿', AO: '🇦🇴', BJ: '🇧🇯', BW: '🇧🇼', BF: '🇧🇫', BI: '🇧🇮',
    CM: '🇨🇲', CV: '🇨🇻', CF: '🇨🇫', TD: '🇹🇩', KM: '🇰🇲', CG: '🇨🇬',
    CD: '🇨🇩', CI: '🇨🇮', DJ: '🇩🇯', EG: '🇪🇬', GQ: '🇬🇶', ER: '🇪🇷',
    SZ: '🇸🇿', ET: '🇪🇹', GA: '🇬🇦', GM: '🇬🇲', GH: '🇬🇭', GN: '🇬🇳',
    GW: '🇬🇼', KE: '🇰🇪', LS: '🇱🇸', LR: '🇱🇷', LY: '🇱🇾', MG: '🇲🇬',
    MW: '🇲🇼', ML: '🇲🇱', MR: '🇲🇷', MU: '🇲🇺', MA: '🇲🇦', MZ: '🇲🇿',
    NA: '🇳🇦', NE: '🇳🇪', NG: '🇳🇬', RW: '🇷🇼', ST: '🇸🇹', SN: '🇸🇳',
    SC: '🇸🇨', SL: '🇸🇱', SO: '🇸🇴', ZA: '🇿🇦', SS: '🇸🇸', SD: '🇸🇩',
    TZ: '🇹🇿', TG: '🇹🇬', TN: '🇹🇳', UG: '🇺🇬', ZM: '🇿🇲', ZW: '🇿🇼',
    
    // Europe
    AL: '🇦🇱', DE: '🇩🇪', AD: '🇦🇩', AT: '🇦🇹', BY: '🇧🇾', BE: '🇧🇪',
    BA: '🇧🇦', BG: '🇧🇬', HR: '🇭🇷', DK: '🇩🇰', ES: '🇪🇸', EE: '🇪🇪',
    FI: '🇫🇮', FR: '🇫🇷', GR: '🇬🇷', HU: '🇭🇺', IE: '🇮🇪', IS: '🇮🇸',
    IT: '🇮🇹', LV: '🇱🇻', LI: '🇱🇮', LT: '🇱🇹', LU: '🇱🇺', MT: '🇲🇹',
    MD: '🇲🇩', MC: '🇲🇨', ME: '🇲🇪', NO: '🇳🇴', NL: '🇳🇱', PL: '🇵🇱',
    PT: '🇵🇹', CZ: '🇨🇿', RO: '🇷🇴', GB: '🇬🇧', RU: '🇷🇺', SM: '🇸🇲',
    RS: '🇷🇸', SK: '🇸🇰', SI: '🇸🇮', SE: '🇸🇪', CH: '🇨🇭', UA: '🇺🇦',
    
    // Amériques
    US: '🇺🇸', CA: '🇨🇦', MX: '🇲🇽', BR: '🇧🇷', AR: '🇦🇷', CL: '🇨🇱',
    CO: '🇨🇴', PE: '🇵🇪', VE: '🇻🇪', EC: '🇪🇨', UY: '🇺🇾', PY: '🇵🇾',
    BO: '🇧🇴', GY: '🇬🇾', SR: '🇸🇷',
    
    // Asie
    CN: '🇨🇳', IN: '🇮🇳', JP: '🇯🇵', KR: '🇰🇷', TH: '🇹🇭', VN: '🇻🇳',
    ID: '🇮🇩', MY: '🇲🇾', SG: '🇸🇬', PH: '🇵🇭', PK: '🇵🇰', BD: '🇧🇩',
    IR: '🇮🇷', IQ: '🇮🇶', SA: '🇸🇦', AE: '🇦🇪', TR: '🇹🇷', IL: '🇮🇱',
    AF: '🇦🇫', AM: '🇦🇲', AZ: '🇦🇿', BH: '🇧🇭', BT: '🇧🇹', BN: '🇧🇳',
    KH: '🇰🇭', CY: '🇨🇾', KP: '🇰🇵', GE: '🇬🇪', HK: '🇭🇰', JO: '🇯🇴',
    KZ: '🇰🇿', KW: '🇰🇼', KG: '🇰🇬', LA: '🇱🇦', LB: '🇱🇧', MO: '🇲🇴',
    MV: '🇲🇻', MN: '🇲🇳', MM: '🇲🇲', NP: '🇳🇵', OM: '🇴🇲', UZ: '🇺🇿',
    PS: '🇵🇸', QA: '🇶🇦', LK: '🇱🇰', SY: '🇸🇾', TW: '🇹🇼', TJ: '🇹🇯',
    TL: '🇹🇱', TM: '🇹🇲', YE: '🇾🇪',
    
    // Océanie
    AU: '🇦🇺', NZ: '🇳🇿', FJ: '🇫🇯', PG: '🇵🇬', KI: '🇰🇮', MH: '🇲🇭',
    FM: '🇫🇲', NR: '🇳🇷', PW: '🇵🇼', WS: '🇼🇸', SB: '🇸🇧', TO: '🇹🇴',
    TV: '🇹🇻', VU: '🇻🇺'
  };
  
  return flags[countryCode] || '🌍';
}

// Base de données des codes pays
const countryCodes = {
  // Afrique
  DZ: { code: "+213", name: "Algérie" },
  AO: { code: "+244", name: "Angola" },
  BJ: { code: "+229", name: "Bénin" },
  BW: { code: "+267", name: "Botswana" },
  BF: { code: "+226", name: "Burkina Faso" },
  BI: { code: "+257", name: "Burundi" },
  CM: { code: "+237", name: "Cameroun" },
  CV: { code: "+238", name: "Cap-Vert" },
  CF: { code: "+236", name: "Centrafrique" },
  TD: { code: "+235", name: "Tchad" },
  KM: { code: "+269", name: "Comores" },
  CG: { code: "+242", name: "Congo-Brazzaville" },
  CD: { code: "+243", name: "Congo-Kinshasa" },
  CI: { code: "+225", name: "Côte d'Ivoire" },
  DJ: { code: "+253", name: "Djibouti" },
  EG: { code: "+20", name: "Égypte" },
  GQ: { code: "+240", name: "Guinée équatoriale" },
  ER: { code: "+291", name: "Érythrée" },
  SZ: { code: "+268", name: "Eswatini" },
  ET: { code: "+251", name: "Éthiopie" },
  GA: { code: "+241", name: "Gabon" },
  GM: { code: "+220", name: "Gambie" },
  GH: { code: "+233", name: "Ghana" },
  GN: { code: "+224", name: "Guinée" },
  GW: { code: "+245", name: "Guinée-Bissau" },
  KE: { code: "+254", name: "Kenya" },
  LS: { code: "+266", name: "Lesotho" },
  LR: { code: "+231", name: "Liberia" },
  LY: { code: "+218", name: "Libye" },
  MG: { code: "+261", name: "Madagascar" },
  MW: { code: "+265", name: "Malawi" },
  ML: { code: "+223", name: "Mali" },
  MR: { code: "+222", name: "Mauritanie" },
  MU: { code: "+230", name: "Maurice" },
  MA: { code: "+212", name: "Maroc" },
  MZ: { code: "+258", name: "Mozambique" },
  NA: { code: "+264", name: "Namibie" },
  NE: { code: "+227", name: "Niger" },
  NG: { code: "+234", name: "Nigéria" },
  RW: { code: "+250", name: "Rwanda" },
  ST: { code: "+239", name: "Sao Tomé-et-Principe" },
  SN: { code: "+221", name: "Sénégal" },
  SC: { code: "+248", name: "Seychelles" },
  SL: { code: "+232", name: "Sierra Leone" },
  SO: { code: "+252", name: "Somalie" },
  ZA: { code: "+27", name: "Afrique du Sud" },
  SS: { code: "+211", name: "Soudan du Sud" },
  SD: { code: "+249", name: "Soudan" },
  TZ: { code: "+255", name: "Tanzanie" },
  TG: { code: "+228", name: "Togo" },
  TN: { code: "+216", name: "Tunisie" },
  UG: { code: "+256", name: "Ouganda" },
  ZM: { code: "+260", name: "Zambie" },
  ZW: { code: "+263", name: "Zimbabwe" },

  // Europe
  AL: { code: "+355", name: "Albanie" },
  DE: { code: "+49", name: "Allemagne" },
  AD: { code: "+376", name: "Andorre" },
  AT: { code: "+43", name: "Autriche" },
  BY: { code: "+375", name: "Biélorussie" },
  BE: { code: "+32", name: "Belgique" },
  BA: { code: "+387", name: "Bosnie-Herzégovine" },
  BG: { code: "+359", name: "Bulgarie" },
  HR: { code: "+385", name: "Croatie" },
  DK: { code: "+45", name: "Danemark" },
  ES: { code: "+34", name: "Espagne" },
  EE: { code: "+372", name: "Estonie" },
  FI: { code: "+358", name: "Finlande" },
  FR: { code: "+33", name: "France" },
  GR: { code: "+30", name: "Grèce" },
  HU: { code: "+36", name: "Hongrie" },
  IE: { code: "+353", name: "Irlande" },
  IS: { code: "+354", name: "Islande" },
  IT: { code: "+39", name: "Italie" },
  LV: { code: "+371", name: "Lettonie" },
  LI: { code: "+423", name: "Liechtenstein" },
  LT: { code: "+370", name: "Lituanie" },
  LU: { code: "+352", name: "Luxembourg" },
  MT: { code: "+356", name: "Malte" },
  MD: { code: "+373", name: "Moldavie" },
  MC: { code: "+377", name: "Monaco" },
  ME: { code: "+382", name: "Monténégro" },
  NO: { code: "+47", name: "Norvège" },
  NL: { code: "+31", name: "Pays-Bas" },
  PL: { code: "+48", name: "Pologne" },
  PT: { code: "+351", name: "Portugal" },
  CZ: { code: "+420", name: "République tchèque" },
  RO: { code: "+40", name: "Roumanie" },
  GB: { code: "+44", name: "Royaume-Uni" },
  RU: { code: "+7", name: "Russie" },
  SM: { code: "+378", name: "Saint-Marin" },
  RS: { code: "+381", name: "Serbie" },
  SK: { code: "+421", name: "Slovaquie" },
  SI: { code: "+386", name: "Slovénie" },
  SE: { code: "+46", name: "Suède" },
  CH: { code: "+41", name: "Suisse" },
  UA: { code: "+380", name: "Ukraine" },

  // Amériques
  US: { code: "+1", name: "États-Unis" },
  CA: { code: "+1", name: "Canada" },
  MX: { code: "+52", name: "Mexique" },
  BR: { code: "+55", name: "Brésil" },
  AR: { code: "+54", name: "Argentine" },
  CL: { code: "+56", name: "Chili" },
  CO: { code: "+57", name: "Colombie" },
  PE: { code: "+51", name: "Pérou" },
  VE: { code: "+58", name: "Venezuela" },
  EC: { code: "+593", name: "Équateur" },
  UY: { code: "+598", name: "Uruguay" },
  PY: { code: "+595", name: "Paraguay" },
  BO: { code: "+591", name: "Bolivie" },
  GY: { code: "+592", name: "Guyana" },
  SR: { code: "+597", name: "Suriname" },

  // Asie
  CN: { code: "+86", name: "Chine" },
  IN: { code: "+91", name: "Inde" },
  JP: { code: "+81", name: "Japon" },
  KR: { code: "+82", name: "Corée du Sud" },
  TH: { code: "+66", name: "Thaïlande" },
  VN: { code: "+84", name: "Viêt Nam" },
  ID: { code: "+62", name: "Indonésie" },
  MY: { code: "+60", name: "Malaisie" },
  SG: { code: "+65", name: "Singapour" },
  PH: { code: "+63", name: "Philippines" },
  PK: { code: "+92", name: "Pakistan" },
  BD: { code: "+880", name: "Bangladesh" },
  IR: { code: "+98", name: "Iran" },
  IQ: { code: "+964", name: "Irak" },
  SA: { code: "+966", name: "Arabie saoudite" },
  AE: { code: "+971", name: "Émirats arabes unis" },
  TR: { code: "+90", name: "Turquie" },
  IL: { code: "+972", name: "Israël" },
  AF: { code: "+93", name: "Afghanistan" },
  AM: { code: "+374", name: "Arménie" },
  AZ: { code: "+994", name: "Azerbaïdjan" },
  BH: { code: "+973", name: "Bahreïn" },
  BT: { code: "+975", name: "Bhoutan" },
  BN: { code: "+673", name: "Brunei" },
  KH: { code: "+855", name: "Cambodge" },
  CY: { code: "+357", name: "Chypre" },
  KP: { code: "+850", name: "Corée du Nord" },
  GE: { code: "+995", name: "Géorgie" },
  HK: { code: "+852", name: "Hong Kong" },
  JO: { code: "+962", name: "Jordanie" },
  KZ: { code: "+7", name: "Kazakhstan" },
  KW: { code: "+965", name: "Koweït" },
  KG: { code: "+996", name: "Kirghizistan" },
  LA: { code: "+856", name: "Laos" },
  LB: { code: "+961", name: "Liban" },
  MO: { code: "+853", name: "Macao" },
  MV: { code: "+960", name: "Maldives" },
  MN: { code: "+976", name: "Mongolie" },
  MM: { code: "+95", name: "Myanmar" },
  NP: { code: "+977", name: "Népal" },
  OM: { code: "+968", name: "Oman" },
  UZ: { code: "+998", name: "Ouzbékistan" },
  PS: { code: "+970", name: "Palestine" },
  QA: { code: "+974", name: "Qatar" },
  LK: { code: "+94", name: "Sri Lanka" },
  SY: { code: "+963", name: "Syrie" },
  TW: { code: "+886", name: "Taïwan" },
  TJ: { code: "+992", name: "Tadjikistan" },
  TL: { code: "+670", name: "Timor oriental" },
  TM: { code: "+993", name: "Turkménistan" },
  YE: { code: "+967", name: "Yémen" },

  // Océanie
  AU: { code: "+61", name: "Australie" },
  NZ: { code: "+64", name: "Nouvelle-Zélande" },
  FJ: { code: "+679", name: "Fidji" },
  PG: { code: "+675", name: "Papouasie-Nouvelle-Guinée" },
  KI: { code: "+686", name: "Kiribati" },
  MH: { code: "+692", name: "Îles Marshall" },
  FM: { code: "+691", name: "Micronésie" },
  NR: { code: "+674", name: "Nauru" },
  PW: { code: "+680", name: "Palaos" },
  WS: { code: "+685", name: "Samoa" },
  SB: { code: "+677", name: "Îles Salomon" },
  TO: { code: "+676", name: "Tonga" },
  TV: { code: "+688", name: "Tuvalu" },
  VU: { code: "+678", name: "Vanuatu" }
};
