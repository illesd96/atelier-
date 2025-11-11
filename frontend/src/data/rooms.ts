export interface RoomData {
  id: string;
  name: string;
  title: {
    hu: string;
    en: string;
  };
  subtitle: {
    hu: string;
    en: string;
  };
  description: {
    hu: string;
    en: string;
  };
  features: {
    hu: string[];
    en: string[];
  };
  specs: {
    size: string;
    capacity: string;
    availability: string;
    price: string;
  };
  heroImage: string;
  galleryImages: string[];
}

export const roomsData: RoomData[] = [
  {
    id: 'studio-a',
    name: 'Atelier',
    title: {
      hu: 'Atelier',
      en: 'Atelier Room'
    },
    subtitle: {
      hu: 'Rusztikus berendezés, természetes színekkel',
      en: 'Rustic furnishings with natural colors'
    },
    description: {
      hu: 'Az Atelier tér a merészség manifesztuma. Ez a szoba a konvenciók elhagyásáról szól - modern, letisztult, mégis drámai. A karácsonyi időszakban az Atelier egy immerzív havas fenyőerdővé alakul, ahol a valóság és mesevilág határai elmosódnak. Sétálj be az erdőbe, érezd, ahogy a talpad alatt szinte roppan a hó és felejtsd el, hogy valójából 4 fal vesz körbe. Farönkök, apró manók, szánkó és egy pad, ahol meg lehet pihenni, minden részlet egy téli álomvilágot idéz. Az installáció nem csupán látványos, hanem egyedülálló Budapesten: tér maga válik élménnyé, egy fotózásokra, kampányokra és videós tartalmakra tervezett immerzív díszletté, ahol a kreativitás és az érzelmi hatás találkozik. Az Atelier most a merész álmodozók tere, ahol a tél is új értelmet kap.',
      en: 'The Atelier space is a manifesto of boldness. This room is about leaving conventions behind - modern, minimalist, yet dramatic. During the Christmas season, the Atelier transforms into an immersive snowy pine forest, where the boundaries between reality and fairy tale blur. Step into the forest, feel the snow crunching beneath your feet, and forget that you\'re actually surrounded by four walls. Tree logs, tiny gnomes, a sled, and a bench to rest on - every detail evokes a winter wonderland. The installation is not only spectacular but unique in Budapest: the space itself becomes an experience, an immersive set designed for photo shoots, campaigns, and video content, where creativity and emotional impact meet. The Atelier is now a space for bold dreamers, where winter takes on new meaning.'
    },
    features: {
      hu: [
        'Modern, letisztult, mégis drámai',
        '33 m2',
        'Természetes, neutrális színek',
        '3 órás ablak',
        'Északi tájolás, szórt fényekkel',
        'Maximum létszám: 5 fő',
        'Fix 2 db állandó fényű LED lámpa',
        'Opcionálisan kérhető vaku',
        'Minden nap 8:00-tól, óránként foglalható',
        '15 000 Ft / 55 perc'
      ],
      en: [
        'Modern, clean, yet dramatic',
        '33 m2',
        'Natural, neutral colors',
        '3-hour window',
        'Northern exposure, diffused lights',
        'Maximum capacity: 10 people',
        'Fixed 2 continuous LED lights',
        'Optionally available flash unit',
        'Available daily from 8:00, hourly bookings',
        '15,000 HUF / 55 minutes'
      ]
    },
    specs: {
      size: '33 m2',
      capacity: '5',
      availability: '8:00-20:00',
      price: '15,000'
    },
    heroImage: '/images/atelier/title.png',
    galleryImages: [
      '/images/atelier/1.jpg',
      '/images/atelier/2.jpg',
      '/images/atelier/3.jpg',
      '/images/atelier/4.jpg',
      '/images/atelier/5.jpg',
      '/images/atelier/6.jpg',
      '/images/atelier/7.jpg',
      '/images/atelier/8.jpg',
      '/images/atelier/9.jpg'
    ]
  },
  {
    id: 'studio-b',
    name: 'Frigyes',
    title: {
      hu: 'Frigyes',
      en: 'Frigyes Room'
    },
    subtitle: {
      hu: 'Meleg, barátságos és játékos világ',
      en: 'A warm, friendly and playful world'
    },
    description: {
      hu: 'A Frigyes egy meleg, barátságos és játékos világ, ahol természetes anyagok és modern formák találkoznak. Rusztikus textúrák, lágy tónusok és organikus részletek hozzák létre azt a hangulatot, ami egyszerre otthonos és inspiráló. A karácsonyi időszakban a Frigyes egy klasszikus, mégis friss ünnepi enteriőrré alakul. A tér középpontjában egy piros bársony masnikkal és olivazöld, bézs, barna díszekkel ékesített karácsonyfa áll, mellette egy kerek étkezőasztal ünnepi terítékkel és felette lebegő koszorú dísz. A háttérben lágyan hullámzó függönyök és rusztikus falak keretezik a teret, egy modern bézs íves kanapé felett pedig csillagok lebegnek. A Frigyeshez tartozik egy kisebb szoba is — egy igazi gyerekvilág, ahol most egy sátor várja a kicsiket, hogy bekuckózhassanak, miközben piros-fehér csíkos cukorka lufik lebegnek körülöttük. Egy apró, édes univerzum, ahol minden részlet mosolyt hív elő. A Frigyes tér ideális lifestyle fotózásokhoz, családi képekhez és hangulatos videós tartalmakhoz — egy hely, ahol a melegség, a játékosság és a meghittség tökéletes harmóniába kerül.',
      en: 'Frigyes is a warm, friendly, and playful world where natural materials meet modern forms. Rustic textures, soft tones, and organic details create an atmosphere that is both homely and inspiring. During the Christmas season, Frigyes transforms into a classic yet fresh festive interior. At the center of the space stands a Christmas tree decorated with a red velvet bow and olive green, beige, and brown ornaments, next to a round dining table with festive table settings and a wreath hanging above. In the background, softly flowing curtains and rustic walls frame the space, while stars float above a modern beige curved sofa. Frigyes also includes a smaller room — a true children\'s world, where a tent now awaits little ones to cuddle up inside, surrounded by red and white striped candy cane balloons floating around them. A tiny, sweet universe where every detail brings a smile. The Frigyes space is ideal for lifestyle photography, family portraits, and atmospheric video content — a place where warmth, playfulness, and coziness come together in perfect harmony.'
    },
    features: {
      hu: [
        'Minimalista, modern design',
        '34 + 16 m2',
        '2025, november 15-től karácsonyi dekoráció!',
        '3 órás ablak',
        'Északi tájolás, szórt fényekkel',
        'Maximum létszám: 6 fő',
        'Fix 2 db állandó fényű LED lámpa',
        'Opcionálisan kérhető vaku',
        'Minden nap 8:00-tól, óránként foglalható',
        '15 000 Ft / 55 perc'
      ],
      en: [
        'Minimalist, modern design',
        '34 + 16 m2',
        'Christmas decorations from November 15, 2025!',
        '3-hour window',
        'Northern exposure, diffused lights',
        'Maximum capacity: 6 people',
        'Fixed 2 continuous LED light',
        'Optionally available flash units',
        'Available daily from 8:00, hourly bookings',
        '15,000 HUF / 55 minutes'
      ]
    },
    specs: {
      size: '50 m2',
      capacity: '6',
      availability: '8:00-20:00',
      price: '15,000'
    },
    heroImage: '/images/frigyes/title.png',
    galleryImages: [
      '/images/frigyes/1.jpg',
      '/images/frigyes/2.jpg',
      '/images/frigyes/3.jpg',
      '/images/frigyes/4.jpg',
      '/images/frigyes/5.jpg',
      '/images/frigyes/6.jpg',
      '/images/frigyes/7.jpg',
      '/images/frigyes/8.jpg',
      '/images/frigyes/9.jpg'
    ]
  },
  {
    id: 'studio-c',
    name: 'Karinthy',
    title: {
      hu: 'Karinthy',
      en: 'Karinthy Room'
    },
    subtitle: {
      hu: 'Klasszikus elegancia újragondolt formája',
      en: 'Reimagined form of classic elegance'
    },
    description: {
      hu: 'A Karinthy tér a klasszikus elegancia újragondolt formája. Díszlécekkel keretezett, olivazöld falai mélységet és kifinomultságot sugároznak, miközben a tér középpontjában egy kandalló teremti meg az otthonosság melegét. A karácsonyi időszakban a Karinthy enteriőrje a zöld és arany párosára épül, amit fekete-fehér csíkos díszek és nagy méretű masnik egészítenek ki, modern csavart adva a klasszikus harmóniának. A stílusos kontrasztok, a fényes és matt felületek játéka, valamint a hangulatos világítás olyan atmoszférát teremt, ami egyszerre elegáns, időtlen és karakteres. A Karinthy tér ideális portréfotózásokhoz, elegáns kampányokhoz és meghitt eseményekhez — egy hely, ahol a múlt bája és a jelen lendülete találkozik, és ahol minden részlet a történetmesélés szolgálatában áll.',
      en: 'The Karinthy space is a reimagined form of classic elegance. Its olive green walls, framed with moldings, radiate depth and sophistication, while a fireplace at the center of the space creates the warmth of homeliness. During the Christmas season, the Karinthy interior is built on a pairing of green and gold, complemented by black and white striped decorations and large bows, giving a modern twist to the classic harmony. The stylish contrasts, the interplay of glossy and matte surfaces, and the atmospheric lighting create an ambiance that is at once elegant, timeless, and characterful. The Karinthy space is ideal for portrait photography, elegant campaigns, and intimate events — a place where the charm of the past meets the momentum of the present, and where every detail serves the art of storytelling.'
    },
    features: {
      hu: [
        'Klasszikus elegancia, modern csavarral',
        '28 m2',
        '2025, november 15-től karácsonyi dekoráció!',
        'Olivazöld falak díszlécekkel',
        'Kandalló a tér központjában',
        'Maximum létszám: 5 fő',
        'Fix 2 db állandó fényű LED lámpa',
        'Opcionálisan kérhető vaku',
        'Minden nap 8:00-tól, óránként foglalható',
        '15 000 Ft / 55 perc'
      ],
      en: [
        'Classic elegance with a modern twist',
        '28 m2',
        'Christmas decorations from November 15, 2025!',
        'Olive green walls with moldings',
        'Fireplace at the center of the space',
        'Maximum capacity: 5 people',
        'Fixed 2 continuous LED lights',
        'Optionally available flash units',
        'Available daily from 8:00, hourly bookings',
        '15,000 HUF / 55 minutes'
      ]
    },
    specs: {
      size: '28 m2',
      capacity: '10',
      availability: '8:00-20:00',
      price: '15,000'
    },
    heroImage: '/images/karinthy/title.png',
    galleryImages: [
      '/images/karinthy/1.jpg',
      '/images/karinthy/2.jpg',
      '/images/karinthy/3.jpg',
      '/images/karinthy/4.jpg',
      '/images/karinthy/5.jpg',
      '/images/karinthy/6.jpg',
      '/images/karinthy/7.jpg',
      '/images/karinthy/8.jpg',
      '/images/karinthy/9.jpg'
    ]
  }
];

export const getRoomById = (id: string): RoomData | undefined => {
  return roomsData.find(room => room.id === id);
};

export const getOtherRooms = (currentRoomId: string): RoomData[] => {
  return roomsData.filter(room => room.id !== currentRoomId);
};

