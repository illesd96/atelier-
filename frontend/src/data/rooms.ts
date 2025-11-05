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
      hu: 'Az Atelier terem a frissen hullott hó és a karácsonyi fenyők varázslatos hangulatát idézi. A hófedte lucfenyők, a puha hó és a finom fények meghitt, ünnepi atmoszférát teremtenek. Egy igazi téli álomvilág!',
      en: 'The Rustic room provides a natural environment for photography with its rustic furnishing style and neutral colors. It is also the largest room in the studio, totaling 120 square meters.'
    },
    features: {
      hu: [
        'Minimalista, rusztikus design',
        '120 m2',
        'Természetes, neutrális színek',
        '3 órás ablak',
        'Északi tájolás, szórt fényekkel',
        'Maximum létszám: 10 fő',
        'Fix 2 db állandó fényű LED lámpa',
        'Opcionálisan kérhető 2 db vaku',
        'Minden nap 9:00-tól, óránként foglalható',
        '15 000 Ft / 55 perc'
      ],
      en: [
        'Minimalist, rustic design',
        '120 m2',
        'Natural, neutral colors',
        '3-hour window',
        'Northern exposure, diffused lights',
        'Maximum capacity: 10 people',
        'Fixed 2 continuous LED lights',
        'Optionally available 2 flash units',
        'Available daily from 9:00, hourly bookings',
        '15,000 HUF / 55 minutes'
      ]
    },
    specs: {
      size: '120 m2',
      capacity: '10',
      availability: '9:00-20:00',
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
      hu: 'Modern minimalizmus, föld színekkel, japandi stílusjegyekkel',
      en: 'Modern minimalism with earth tones and japandi style elements'
    },
    description: {
      hu: 'Modern minimalizmus, föld színekkel, japandi stílusjegyekkel. Tökéletes helyszíne a mind a branding, mind a családos fotózásoknak.',
      en: 'Modern minimalism with earth tones and japandi style elements. Perfect location for both branding and family photo shoots.'
    },
    features: {
      hu: [
        'Minimalista, modern design',
        '65 m2',
        '2025, október 25-től karácsonyi dekoráció!',
        '3 órás ablak',
        'Északi tájolás, szórt fényekkel',
        'Maximum létszám: 8 fő',
        'Fix 1 db állandó fényű LED lámpa',
        'Opcionálisan kérhető 2 db vaku',
        'Minden nap 9:00-tól, óránként foglalható',
        '17 000 Ft / 55 perc'
      ],
      en: [
        'Minimalist, modern design',
        '65 m2',
        '2025, October 25-től karácsonyi dekoráció!',
        '3-hour window',
        'Northern exposure, diffused lights',
        'Maximum capacity: 8 people',
        'Fixed 1 continuous LED light',
        'Optionally available 2 flash units',
        'Available daily from 9:00, hourly bookings',
        '17,000 HUF / 55 minutes'
      ]
    },
    specs: {
      size: '65 m2',
      capacity: '8',
      availability: '9:00-20:00',
      price: '17,000'
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
      hu: 'Fiatalos, letisztult és lakásszerű',
      en: 'Youthful, clean and apartment-like'
    },
    description: {
      hu: 'A Lost fiatalos, letisztult és lakásszerű berendezés jellemzi. A termet 3 óriási ablak tölti meg fénnyel és egy konyhával összekapcsolt nappali várja a vendégeit, rengeteg kiegészítővel.',
      en: 'The Lost room is characterized by youthful, clean and apartment-like furnishings. The room is filled with light from 3 huge windows and a living room connected to a kitchen awaits guests, with lots of accessories.'
    },
    features: {
      hu: [
        'Fiatalos, modern design',
        '85 m2',
        '3 óriási ablak',
        'Konyhával összekapcsolt nappali',
        'Rengeteg kiegészítő',
        'Maximum létszám: 10 fő',
        'Fix 1 db állandó fényű LED lámpa',
        'Opcionálisan kérhető 2 db vaku',
        'Minden nap 9:00-tól, óránként foglalható',
        '15 000 Ft / 55 perc'
      ],
      en: [
        'Youthful, modern design',
        '85 m2',
        '3 huge windows',
        'Living room connected to kitchen',
        'Lots of accessories',
        'Maximum capacity: 10 people',
        'Fixed 1 continuous LED light',
        'Optionally available 2 flash units',
        'Available daily from 9:00, hourly bookings',
        '15,000 HUF / 55 minutes'
      ]
    },
    specs: {
      size: '85 m2',
      capacity: '10',
      availability: '9:00-20:00',
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

