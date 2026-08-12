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
      hu: 'Az Atelier tér a merészség manifesztuma. Ez a szoba a konvenciók elhagyásáról szól - modern, letisztult, mégis drámai. Természetes, neutrális színek, három óriásablak és lágy, szórt északi fény jellemzi. Az Atelier ideális fotózásokhoz, kampányokhoz és videós tartalmakhoz, egy tér, ahol a kreativitás és az érzelmi hatás találkozik.',
      en: 'The Atelier space is a manifesto of boldness. This room is about leaving conventions behind - modern, minimalist, yet dramatic. It is defined by natural, neutral colors, three giant windows, and soft, diffused northern light. The Atelier is ideal for photo shoots, campaigns, and video content, a space where creativity and emotional impact meet.'
    },
    features: {
      hu: [
        'Modern, letisztult, mégis drámai',
        '33 m2',
        'Természetes, neutrális színek',
        '3 óriás ablak',
        'Északi tájolás, szórt fényekkel',
        'Fix 2 db állandó fényű LED lámpa',
        'Opcionálisan kérhető vaku',
        'Minden nap 8:00-tól, óránként foglalható'
      ],
      en: [
        'Modern, clean, yet dramatic',
        '33 m2',
        'Natural, neutral colors',
        '3 giant windows',
        'Northern exposure, diffused lights',
        'Maximum capacity: 10 people',
        'Fixed 2 continuous LED lights',
        'Optionally available flash unit',
        'Available daily from 8:00, hourly bookings'
      ]
    },
    specs: {
      size: '33 m2',
      capacity: '5',
      availability: '8:00-20:00',
      price: '13,000'
    },
    heroImage: '/images/atelier/atelier-01.jpg',
    galleryImages: [
      '/images/atelier/atelier-01.jpg',
      '/images/atelier/atelier-02.jpg',
      '/images/atelier/atelier-03.jpg',
      '/images/atelier/atelier-04.jpg',
      '/images/atelier/atelier-05.jpg',
      '/images/atelier/atelier-06.jpg',
      '/images/atelier/atelier-07.jpg',
      '/images/atelier/atelier-08.jpg',
      '/images/atelier/atelier-09.jpg',
      '/images/atelier/atelier-10.jpg',
      '/images/atelier/atelier-11.jpg',
      '/images/atelier/atelier-12.jpg',
      '/images/atelier/atelier-13.jpg',
      '/images/atelier/atelier-14.jpg',
      '/images/atelier/atelier-15.jpg',
      '/images/atelier/atelier-16.jpg',
      '/images/atelier/atelier-17.jpg',
      '/images/atelier/atelier-18.jpg',
      '/images/atelier/atelier-19.jpg',
      '/images/atelier/atelier-20.jpg',
      '/images/atelier/atelier-21.jpg',
      '/images/atelier/atelier-22.jpg',
      '/images/atelier/atelier-23.jpg',
      '/images/atelier/atelier-24.jpg'
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
      hu: 'A Frigyes egy meleg, barátságos és játékos világ, ahol természetes anyagok és modern formák találkoznak. Rusztikus textúrák, lágy tónusok és organikus részletek hozzák létre azt a hangulatot, ami egyszerre otthonos és inspiráló. A Frigyeshez tartozik egy kisebb szoba is, egy igazi gyerekvilág, ahol minden részlet mosolyt hív elő. A Frigyes tér ideális lifestyle fotózásokhoz, családi képekhez és hangulatos videós tartalmakhoz egy hely, ahol a melegség, a játékosság és a meghittség tökéletes harmóniába kerül.',
      en: 'Frigyes is a warm, friendly, and playful world where natural materials meet modern forms. Rustic textures, soft tones, and organic details create an atmosphere that is both homely and inspiring. Frigyes also includes a smaller room, a true children\'s world where every detail brings a smile. The Frigyes space is ideal for lifestyle photography, family portraits, and atmospheric video content a place where warmth, playfulness, and coziness come together in perfect harmony.'
    },
    features: {
      hu: [
        'Meleg, barátságos, rusztikus dizájn ',
        '34 + 16 m2',
        'Nyugati tájolás, szórt fényekkel',
        'Fix 2 db állandó fényű LED lámpa',
        'Opcionálisan kérhető vaku',
        'Minden nap 8:00-tól, óránként foglalható'
      ],
      en: [
        'Minimalist, modern design',
        '34 + 16 m2',
        'Northern exposure, diffused lights',
        'Maximum capacity: 6 people',
        'Fixed 2 continuous LED light',
        'Optionally available flash units',
        'Available daily from 8:00, hourly bookings'
      ]
    },
    specs: {
      size: '50 m2',
      capacity: '6',
      availability: '8:00-20:00',
      price: '13,000'
    },
    heroImage: '/images/frigyes/frigyes-01.jpg',
    galleryImages: [
      '/images/frigyes/frigyes-01.jpg',
      '/images/frigyes/frigyes-02.jpg',
      '/images/frigyes/frigyes-03.jpg',
      '/images/frigyes/frigyes-04.jpg',
      '/images/frigyes/frigyes-05.jpg',
      '/images/frigyes/frigyes-06.jpg',
      '/images/frigyes/frigyes-07.jpg',
      '/images/frigyes/frigyes-08.jpg',
      '/images/frigyes/frigyes-09.jpg',
      '/images/frigyes/frigyes-10.jpg',
      '/images/frigyes/frigyes-11.jpg',
      '/images/frigyes/frigyes-12.jpg',
      '/images/frigyes/frigyes-13.jpg',
      '/images/frigyes/frigyes-14.jpg',
      '/images/frigyes/frigyes-15.jpg'
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
      hu: 'A Karinthy tér a klasszikus elegancia újragondolt formája. Díszlécekkel keretezett, olivazöld falai mélységet és kifinomultságot sugároznak, miközben a tér középpontjában egy kandalló teremti meg az otthonosság melegét. A stílusos kontrasztok, a fényes és matt felületek játéka, valamint a hangulatos világítás olyan atmoszférát teremt, ami egyszerre elegáns, időtlen és karakteres. A Karinthy tér ideális portréfotózásokhoz, elegáns kampányokhoz és meghitt eseményekhez, egy hely, ahol a múlt bája és a jelen lendülete találkozik, és ahol minden részlet a történetmesélés szolgálatában áll.',
      en: 'The Karinthy space is a reimagined form of classic elegance. Its olive green walls, framed with moldings, radiate depth and sophistication, while a fireplace at the center of the space creates the warmth of homeliness. The stylish contrasts, the interplay of glossy and matte surfaces, and the atmospheric lighting create an ambiance that is at once elegant, timeless, and characterful. The Karinthy space is ideal for portrait photography, elegant campaigns, and intimate events, a place where the charm of the past meets the momentum of the present, and where every detail serves the art of storytelling.'
    },
    features: {
      hu: [
        'Klasszikus elegancia, modern csavarral',
        '28 m2',
        'Olivazöld falak díszlécekkel',
        'Kandalló a tér központjában',
        'Fix 2 db állandó fényű LED lámpa',
        'Opcionálisan kérhető vaku',
        'Minden nap 8:00-tól, óránként foglalható'
      ],
      en: [
        'Classic elegance with a modern twist',
        '28 m2',
        'Olive green walls with moldings',
        'Fireplace at the center of the space',
        'Maximum capacity: 5 people',
        'Fixed 2 continuous LED lights',
        'Optionally available flash units',
        'Available daily from 8:00, hourly bookings'
      ]
    },
    specs: {
      size: '28 m2',
      capacity: '10',
      availability: '8:00-20:00',
      price: '13,000'
    },
    heroImage: '/images/karinthy/karinthy-04.jpg',
    galleryImages: [
      '/images/karinthy/karinthy-01.jpg',
      '/images/karinthy/karinthy-02.jpg',
      '/images/karinthy/karinthy-03.jpg',
      '/images/karinthy/karinthy-04.jpg',
      '/images/karinthy/karinthy-05.jpg',
      '/images/karinthy/karinthy-06.jpg',
      '/images/karinthy/karinthy-07.jpg',
      '/images/karinthy/karinthy-08.jpg',
      '/images/karinthy/karinthy-09.jpg',
      '/images/karinthy/karinthy-10.jpg',
      '/images/karinthy/karinthy-11.jpg',
      '/images/karinthy/karinthy-12.jpg',
      '/images/karinthy/karinthy-13.jpg',
      '/images/karinthy/karinthy-14.jpg',
      '/images/karinthy/karinthy-15.jpg',
      '/images/karinthy/karinthy-16.jpg'
    ]
  },
  {
    id: 'studio-d',
    name: 'Terasz',
    title: {
      hu: 'Terasz',
      en: 'Terasz'
    },
    subtitle: {
      hu: 'Szabadtéri tér, természetes fénnyel',
      en: 'Outdoor space in natural light'
    },
    description: {
      hu: 'A Terasz a stúdió szabadtéri tere, ahol a természetes fény veszi át a főszerepet. Szabad ég alatt fotózhatsz, mégis a stúdió minden kényelmével a hátad mögött. Ideális lifestyle és portré fotózásokhoz, tavaszi-nyári kampányokhoz és minden olyan tartalomhoz, amihez igazi kültéri hangulat kell.',
      en: 'The Terasz is the studio\'s outdoor space, where natural light takes the leading role. Shoot under the open sky with all the comforts of the studio behind you. Ideal for lifestyle and portrait photography, spring-summer campaigns, and any content that calls for a true outdoor atmosphere.'
    },
    features: {
      hu: [
        'Szabadtéri tér',
        'Természetes fény egész nap',
        'A stúdió kényelme karnyújtásnyira',
        'Minden nap 8:00-tól, óránként foglalható'
      ],
      en: [
        'Outdoor space',
        'Natural light all day',
        'Studio comforts within reach',
        'Available daily from 8:00, hourly bookings'
      ]
    },
    specs: {
      size: '',
      capacity: '',
      availability: '8:00-20:00',
      price: '13,000'
    },
    heroImage: '/images/christmas/christmas-terasz.jpg',
    galleryImages: [
      '/images/christmas/christmas-terasz.jpg'
    ]
  },
  {
    id: 'studio-e',
    name: 'Vitrin',
    title: {
      hu: 'Vitrin',
      en: 'Vitrin'
    },
    subtitle: {
      hu: 'Kis üvegház, fényárban úszó, intim tér',
      en: 'A small glass house flooded with light'
    },
    description: {
      hu: 'A Vitrin egy kis üvegház, ahol az üvegfalakon át minden irányból árad be a természetes fény. Intim, mégis különleges tér, amely minden évszakban más arcát mutatja. Tökéletes portrékhoz, páros és családi fotózásokhoz, valamint hangulatos, meghitt tartalmakhoz.',
      en: 'The Vitrin is a small glass house where natural light pours in from every direction through the glass walls. An intimate yet distinctive space that shows a different face in every season. Perfect for portraits, couple and family shoots, and cozy, atmospheric content.'
    },
    features: {
      hu: [
        'Üvegfalak, fény minden irányból',
        'Intim, különleges hangulat',
        'Minden évszakban más arcát mutatja',
        'Minden nap 8:00-tól, óránként foglalható'
      ],
      en: [
        'Glass walls, light from every direction',
        'Intimate, distinctive atmosphere',
        'A different face in every season',
        'Available daily from 8:00, hourly bookings'
      ]
    },
    specs: {
      size: '',
      capacity: '',
      availability: '8:00-20:00',
      price: '16,000'
    },
    heroImage: '/images/christmas/christmas-vitrin.jpg',
    galleryImages: [
      '/images/christmas/christmas-vitrin.jpg'
    ]
  }
];

export const getRoomById = (id: string): RoomData | undefined => {
  return roomsData.find(room => room.id === id);
};

export const getOtherRooms = (currentRoomId: string): RoomData[] => {
  return roomsData.filter(room => room.id !== currentRoomId);
};

