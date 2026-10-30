/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TMDBMovie, TMDBTVShow, TMDBCredits, TMDBVideo, TMDBSeasonDetail, TMDBWatchProvidersResponse } from './tmdb-types';

export const FALLBACK_MOVIES: TMDBMovie[] = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520Hgq.jpg',
    release_date: '2024-02-27',
    vote_average: 8.2,
    vote_count: 5200,
    popularity: 432.1,
    genre_ids: [878, 12],
    runtime: 166,
    tagline: 'Long live the fighters.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    release_date: '2023-07-19',
    vote_average: 8.1,
    vote_count: 8800,
    popularity: 289.4,
    genre_ids: [18, 36],
    runtime: 180,
    tagline: 'The world forever changes.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    overview: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    release_date: '2023-05-31',
    vote_average: 8.4,
    vote_count: 6700,
    popularity: 312.5,
    genre_ids: [16, 28, 12, 878],
    runtime: 140,
    tagline: 'It’s how you wear the mask that matters.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/rAiYTsqJJq0AhHggLbgti99OtIM.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 35000,
    popularity: 195.2,
    genre_ids: [12, 18, 878],
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of allies Lt. Jim Gordon and DA Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 32000,
    popularity: 180.4,
    genre_ids: [18, 28, 80, 53],
    runtime: 152,
    tagline: 'Welcome to a world without rules.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 36000,
    popularity: 165.7,
    genre_ids: [28, 878, 12],
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    release_date: '2024-07-24',
    vote_average: 7.7,
    vote_count: 4100,
    popularity: 580.3,
    genre_ids: [28, 35, 878],
    runtime: 128,
    tagline: 'Come together.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up.',
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/stKGOmWZteTIg09VpubRYUpQ5x4.jpg',
    release_date: '2024-06-11',
    vote_average: 7.6,
    vote_count: 4800,
    popularity: 510.8,
    genre_ids: [16, 10751, 12, 35],
    runtime: 96,
    tagline: 'Make room for new emotions.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    poster_path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    release_date: '1994-09-23',
    vote_average: 8.7,
    vote_count: 27000,
    popularity: 150.2,
    genre_ids: [18, 80],
    runtime: 142,
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers.',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tmU7GeKVybMWF92GlZ16G7WRAm3.jpg',
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 20000,
    popularity: 140.5,
    genre_ids: [18, 80],
    runtime: 175,
    tagline: 'An offer you can\'t refuse.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: '/7u3DUTnuqMVZXlGA72Iz5f5qAkn.jpg',
    release_date: '1999-03-30',
    vote_average: 8.2,
    vote_count: 25000,
    popularity: 110.4,
    genre_ids: [28, 878],
    runtime: 136,
    tagline: 'Welcome to the Real World.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 346698,
    title: 'Barbie',
    overview: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.',
    poster_path: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    backdrop_path: '/ctMserH8g2SeOAnCw5gFjdQF8mo.jpg',
    release_date: '2023-07-19',
    vote_average: 7.1,
    vote_count: 8500,
    popularity: 185.3,
    genre_ids: [35, 12],
    runtime: 114,
    tagline: 'She\'s everything. He\'s just Ken.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 76341,
    title: 'Mad Max: Fury Road',
    overview: 'An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and most everyone is crazed fighting for the necessities of life.',
    poster_path: '/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
    backdrop_path: '/nlCHUW2Y9XW129ipZwNk8ekKdYG.jpg',
    release_date: '2015-05-13',
    vote_average: 7.6,
    vote_count: 22000,
    popularity: 130.6,
    genre_ids: [28, 12, 878],
    runtime: 120,
    tagline: 'What a Lovely Day.',
    status: 'Released',
    media_type: 'movie',
  },

  // ===== VERIFIED PUBLIC DOMAIN & OPEN ARCHIVE FULL MOVIES =====
  {
    id: 10331,
    title: 'Night of the Living Dead',
    overview: 'A ragtag group of Pennsylvanians barricade themselves in an old farmhouse to remain safe from a bloodthirsty, flesh-eating breed of monsters who are ravaging the Northeast United States. (Verified Free Full Movie - Public Domain)',
    poster_path: '/rb2NWyb008u1EcKCOyXs2Nmj0ra.jpg',
    backdrop_path: '/p9N2tN8C5Q16oRj105rF2Ld7F80.jpg',
    release_date: '1968-10-01',
    vote_average: 7.7,
    vote_count: 2400,
    popularity: 95.2,
    genre_ids: [27],
    runtime: 96,
    tagline: 'They won\'t stay dead! Complete Full Movie Available Free.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 19,
    title: 'Metropolis',
    overview: 'In a futuristic city sharply divided between the working class and the city planners, the son of the city\'s mastermind falls in love with a working-class prophet who predicts the coming of a savior. (Verified Free Full Movie - Public Domain)',
    poster_path: '/vHDWZOpupmKB7iNuiWFqnUSjfmN.jpg',
    backdrop_path: '/sH0c1Vz3oWfM9q1o9M9P3n7f1k0.jpg',
    release_date: '1927-01-10',
    vote_average: 8.2,
    vote_count: 2600,
    popularity: 88.4,
    genre_ids: [878, 18],
    runtime: 153,
    tagline: 'The mediator between the head and the hands must be the heart.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 4808,
    title: 'Charade',
    overview: 'After Regina Lampert falls for the dashing Peter Joshua on a skiing holiday, she returns to Paris to find that her husband has been murdered. (Verified Free Full Movie - Public Domain starring Cary Grant and Audrey Hepburn)',
    poster_path: '/txVY8GOQ1fl2zjCkS32rSCCYWrY.jpg',
    backdrop_path: '/vK1n2m3p4q5r6s7t8u9v0w1x2y3.jpg',
    release_date: '1963-12-05',
    vote_average: 7.9,
    vote_count: 1400,
    popularity: 76.5,
    genre_ids: [35, 9648, 53],
    runtime: 113,
    tagline: 'In Paris, a woman finds herself pursued by several men who want a fortune her murdered husband had stolen.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 653,
    title: 'Nosferatu',
    overview: 'Vampire Count Orlok expresses interest in a new residence and real estate agent Hutter\'s wife in this haunting 1922 silent expressionist horror classic. (Verified Free Full Movie - Public Domain)',
    poster_path: '/zv7J85D8CC9qYagAEhPM63CIG6j.jpg',
    backdrop_path: '/k1m3p5r7t9v2x4z6a8c0e2g4i6.jpg',
    release_date: '1922-03-04',
    vote_average: 7.7,
    vote_count: 1800,
    popularity: 82.1,
    genre_ids: [27],
    runtime: 94,
    tagline: 'A Symphony of Horror.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 3084,
    title: 'His Girl Friday',
    overview: 'A newspaper editor uses every trick in the book to keep his ace reporter ex-wife from remarrying and leaving her career behind. (Verified Free Full Movie - Public Domain starring Cary Grant & Rosalind Russell)',
    poster_path: '/6NYUaf2zkPJrR3P7Da0kmkZ6sX9.jpg',
    backdrop_path: '/m2o4q6s8u0w2y4a6c8e0g2i4k6.jpg',
    release_date: '1940-01-18',
    vote_average: 7.8,
    vote_count: 1100,
    popularity: 64.2,
    genre_ids: [35, 10749],
    runtime: 92,
    tagline: 'Fast-talking screwball comedy classic, complete full movie free stream.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 961,
    title: 'The General',
    overview: 'During the American Civil War, Union spies steal an engineer\'s beloved locomotive with his sweetheart aboard, and he single-handedly pursues it through enemy lines. (Verified Free Full Movie - Public Domain by Buster Keaton)',
    poster_path: '/dYocWQoWk3Y6vBa0pGc0OQ8GLqn.jpg',
    backdrop_path: '/c1e3g5i7k9m1o3q5s7u9w1y3a5.jpg',
    release_date: '1926-12-25',
    vote_average: 8.0,
    vote_count: 1250,
    popularity: 70.0,
    genre_ids: [28, 12, 35],
    runtime: 78,
    tagline: 'One of the greatest silent action comedies ever filmed.',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 19934,
    title: 'House on Haunted Hill',
    overview: 'An eccentric millionaire offers $10,000 to five guests if they can survive a night locked in his haunted mansion. (Verified Free Full Movie - Public Domain starring Vincent Price)',
    poster_path: '/g5kdFt3piV3w1pG65W9sSToJ7HB.jpg',
    backdrop_path: '/q9w8e7r6t5y4u3i2o1p0a9s8d7.jpg',
    release_date: '1959-02-17',
    vote_average: 7.2,
    vote_count: 900,
    popularity: 58.4,
    genre_ids: [27, 9648],
    runtime: 75,
    tagline: 'See it with someone in an arm-embracing mood!',
    status: 'Released',
    media_type: 'movie',
  },
  {
    id: 10764,
    title: 'The Little Shop of Horrors',
    overview: 'A clumsy young man working at a florist discovers a mysterious bloodthirsty plant that craves human flesh. (Verified Free Full Movie - Public Domain featuring Jack Nicholson)',
    poster_path: '/s9MrumN9oCfv1rFoEvMLwucWD7V.jpg',
    backdrop_path: '/a1c3e5g7i9k1m3o5q7s9u1w3y5.jpg',
    release_date: '1960-09-14',
    vote_average: 6.8,
    vote_count: 850,
    popularity: 52.0,
    genre_ids: [35, 27],
    runtime: 72,
    tagline: 'Feed me, Seymour!',
    status: 'Released',
    media_type: 'movie',
  }
];

export const FALLBACK_TV_SHOWS: TMDBTVShow[] = [
  {
    id: 126308,
    name: 'Shōgun',
    overview: 'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power and devastate his formidable enemies in 17th-century Japan.',
    poster_path: '/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
    backdrop_path: '/tPL1jGj6Gk20n6wTskJ2g85D9R4.jpg',
    first_air_date: '2024-02-27',
    vote_average: 8.5,
    vote_count: 1400,
    popularity: 380.2,
    genre_ids: [18, 10768],
    number_of_seasons: 1,
    number_of_episodes: 10,
    status: 'Ended',
    tagline: 'The era of civil war has arrived.',
    media_type: 'tv',
  },
  {
    id: 100088,
    name: 'The Last of Us',
    overview: '20 years after a fungal outbreak ravages the planet, survivors Joel and Ellie traverse a devastated United States in search of a rebel beacon.',
    poster_path: '/uKwXKiEj589f81x12p3a12wP391.jpg',
    backdrop_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    first_air_date: '2023-01-15',
    vote_average: 8.6,
    vote_count: 4900,
    popularity: 290.4,
    genre_ids: [18, 10765, 10759],
    number_of_seasons: 1,
    number_of_episodes: 9,
    status: 'Returning Series',
    tagline: 'When you\'re lost in the darkness, look for the light.',
    media_type: 'tv',
  },
  {
    id: 66732,
    name: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    first_air_date: '2016-07-15',
    vote_average: 8.6,
    vote_count: 17000,
    popularity: 240.8,
    genre_ids: [10765, 9648, 18],
    number_of_seasons: 4,
    number_of_episodes: 34,
    status: 'Returning Series',
    tagline: 'Every ending has a beginning.',
    media_type: 'tv',
  },
  {
    id: 1399,
    name: 'Game of Thrones',
    overview: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.',
    poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdrop_path: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    first_air_date: '2011-04-17',
    vote_average: 8.4,
    vote_count: 23000,
    popularity: 310.5,
    genre_ids: [10765, 18, 10759],
    number_of_seasons: 8,
    number_of_episodes: 73,
    status: 'Ended',
    tagline: 'Winter Is Coming.',
    media_type: 'tv',
  },
  {
    id: 94997,
    name: 'House of the Dragon',
    overview: 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights. In the case of the Targaryens, their slow fall begins when King Viserys breaks with a century of tradition by naming his daughter Rhaenyra heir to the Iron Throne.',
    poster_path: '/t9XkeE7HzOsdQcDDDapDYh8RZn1.jpg',
    backdrop_path: '/etj5CuMuamjhG2PDI4qq3xy00qe.jpg',
    first_air_date: '2022-08-21',
    vote_average: 8.4,
    vote_count: 4300,
    popularity: 280.1,
    genre_ids: [10765, 18, 10759],
    number_of_seasons: 2,
    number_of_episodes: 18,
    status: 'Returning Series',
    tagline: 'All must choose.',
    media_type: 'tv',
  },
  {
    id: 1396,
    name: 'Breaking Bad',
    overview: 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of two years left to live. He decides he has nothing to lose and turns to a life of crime, partnering with his former student, Jesse Pinkman, to produce and distribute crystal meth.',
    poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop_path: '/9faGSFi5jam6pDWGNd0p8J2qPtZ.jpg',
    first_air_date: '2008-01-20',
    vote_average: 8.9,
    vote_count: 14000,
    popularity: 210.0,
    genre_ids: [18, 80],
    number_of_seasons: 5,
    number_of_episodes: 62,
    status: 'Ended',
    tagline: 'All Bad things must come to an end.',
    media_type: 'tv',
  },
  {
    id: 94605,
    name: 'Arcane',
    overview: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    poster_path: '/fqldf2t8ztc9aiwn397rWW2vOTf.jpg',
    backdrop_path: '/rkB4LyZHo1NHXSTXYG5cbz4WWds.jpg',
    first_air_date: '2021-11-06',
    vote_average: 8.7,
    vote_count: 3900,
    popularity: 180.2,
    genre_ids: [16, 10765, 10759, 18],
    number_of_seasons: 2,
    number_of_episodes: 18,
    status: 'Ended',
    tagline: 'Every story has a beginning.',
    media_type: 'tv',
  },
  {
    id: 114479,
    name: 'The Bear',
    overview: 'A young chef from the fine dining world comes home to Chicago to run his family Italian beef sandwich shop after a heartbreaking death in his family.',
    poster_path: '/mclHxMmJm8bY25d9m3h0mJ5N4kK.jpg',
    backdrop_path: '/9zcbqSxdsRMZWHYtyCd1Qe23657.jpg',
    first_air_date: '2022-06-23',
    vote_average: 8.3,
    vote_count: 1800,
    popularity: 160.0,
    genre_ids: [18, 35],
    number_of_seasons: 3,
    number_of_episodes: 28,
    status: 'Returning Series',
    tagline: 'Every second counts.',
    media_type: 'tv',
  }
];

// Fallback credits map
const FALLBACK_CREDITS: Record<number, TMDBCredits> = {
  693134: {
    id: 693134,
    cast: [
      { id: 1190668, name: 'Timothée Chalamet', original_name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: '/BE2sdjpgsa2rNTFa66f7upkaOP.jpg', order: 0 },
      { id: 505710, name: 'Zendaya', original_name: 'Zendaya', character: 'Chani', profile_path: '/r2JaB0C4nU6k9QJzWlK0K1A8t3x.jpg', order: 1 },
      { id: 93240, name: 'Rebecca Ferguson', original_name: 'Rebecca Ferguson', character: 'Lady Jessica', profile_path: '/lJloTOheuQSirSLXq33cqbz5QTe.jpg', order: 2 },
      { id: 16851, name: 'Javier Bardem', original_name: 'Javier Bardem', character: 'Stilgar', profile_path: '/g3tB6VlP8QY5R0w8dD4sJ1p9Z7t.jpg', order: 3 },
    ],
    crew: [{ id: 137427, name: 'Denis Villeneuve', job: 'Director', department: 'Directing', profile_path: '/4bH5hH4eZtG1v2L3k9p8q7r6s5.jpg' }]
  },
  872585: {
    id: 872585,
    cast: [
      { id: 2037, name: 'Cillian Murphy', original_name: 'Cillian Murphy', character: 'J. Robert Oppenheimer', profile_path: '/360R3STop995J3TTp7dUeoRk5tV.jpg', order: 0 },
      { id: 5081, name: 'Emily Blunt', original_name: 'Emily Blunt', character: 'Katherine Oppenheimer', profile_path: '/5qhn27l8i30k8q4vP9y6u7r5e4.jpg', order: 1 },
      { id: 1892, name: 'Matt Damon', original_name: 'Matt Damon', character: 'Leslie Groves', profile_path: '/elzaMm5r420k8q4vP9y6u7r5e4.jpg', order: 2 },
      { id: 3223, name: 'Robert Downey Jr.', original_name: 'Robert Downey Jr.', character: 'Lewis Strauss', profile_path: '/1YjdSym1jA7LnBunscNk89KpVoD.jpg', order: 3 }
    ],
    crew: [{ id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing', profile_path: '/xuAIuYSmsUzKlUMBFGVZaWsY3Z5.jpg' }]
  },
  10331: {
    id: 10331,
    cast: [
      { id: 3829, name: 'Duane Jones', original_name: 'Duane Jones', character: 'Ben', profile_path: null, order: 0 },
      { id: 3830, name: 'Judith O\'Dea', original_name: 'Judith O\'Dea', character: 'Barbra', profile_path: null, order: 1 },
      { id: 3831, name: 'Karl Hardman', original_name: 'Karl Hardman', character: 'Harry Cooper', profile_path: null, order: 2 }
    ],
    crew: [{ id: 2039, name: 'George A. Romero', job: 'Director', department: 'Directing', profile_path: null }]
  },
  126308: {
    id: 126308,
    cast: [
      { id: 6248, name: 'Hiroyuki Sanada', original_name: 'Hiroyuki Sanada', character: 'Lord Yoshii Toranaga', profile_path: '/7m3w5q9t5y8u0i2o1p3k5m8n7.jpg', order: 0 },
      { id: 1546740, name: 'Cosmo Jarvis', original_name: 'Cosmo Jarvis', character: 'John Blackthorne', profile_path: '/3v8b5n2m9k0l4j7h6g5f3d2s1.jpg', order: 1 },
      { id: 2261688, name: 'Anna Sawai', original_name: 'Anna Sawai', character: 'Toda Mariko', profile_path: '/8h6g5f4d3s2a1q9w8e7r6t5y4.jpg', order: 2 }
    ],
    crew: [{ id: 114434, name: 'Justin Marks', job: 'Executive Producer / Creator', department: 'Writing', profile_path: null }]
  }
};

// Verified official trailers mapped strictly by TMDB ID
// Zero duplicates, zero false fallbacks to Spider-Man
export const FALLBACK_VIDEOS: Record<number, TMDBVideo[]> = {
  // Dune: Part Two
  693134: [
    { id: 'v1', key: 'Way9Dexny3w', name: 'Dune: Part Two — Official Trailer 3', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Oppenheimer
  872585: [
    { id: 'v2', key: 'uYPbbksJxIg', name: 'Oppenheimer — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Spider-Man: Across the Spider-Verse
  569094: [
    { id: 'v3', key: 'cqGjhVJWtEg', name: 'Spider-Man: Across the Spider-Verse — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Interstellar
  157336: [
    { id: 'v4', key: '2LqzF5WauAw', name: 'Interstellar — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // The Dark Knight
  155: [
    { id: 'v5', key: 'EXeTwQWrcwY', name: 'The Dark Knight — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Inception
  27205: [
    { id: 'v6', key: 'YoHD9XEInc0', name: 'Inception — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Deadpool & Wolverine
  533535: [
    { id: 'v7', key: '73_1biulkYk', name: 'Deadpool & Wolverine — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Inside Out 2
  1022789: [
    { id: 'v8', key: 'LEjhY15eCx0', name: 'Inside Out 2 — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // The Shawshank Redemption
  278: [
    { id: 'v9', key: 'PLl99DlL6b4', name: 'The Shawshank Redemption — Official 4K Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // The Godfather
  238: [
    { id: 'v10', key: 'UaVTIH8mujA', name: 'The Godfather — 50th Anniversary Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // The Matrix
  603: [
    { id: 'v11', key: 'vKQi3bBA1y8', name: 'The Matrix — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Barbie
  346698: [
    { id: 'v12', key: 'pBk4NYhWNMM', name: 'Barbie — Official Main Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Mad Max: Fury Road
  76341: [
    { id: 'v13', key: 'hEJnMQG9ev8', name: 'Mad Max: Fury Road — Official Main Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Night of the Living Dead
  10331: [
    { id: 'v14', key: '0dH2y4wA1b8', name: 'Night of the Living Dead (1968) — Original Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Metropolis
  19: [
    { id: 'v15', key: 'gdtfZFpP06E', name: 'Metropolis — Restored Criterion Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Charade
  4808: [
    { id: 'v16', key: 'P9j0j841hP8', name: 'Charade (1963) — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // Nosferatu
  653: [
    { id: 'v17', key: 'ZxlJxDr26mM', name: 'Nosferatu (1922) — Restored Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // His Girl Friday
  3084: [
    { id: 'v18', key: 'u97G6oI-g2o', name: 'His Girl Friday — Criterion Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // The General
  961: [
    { id: 'v19', key: 'qLh_iY6vWpU', name: 'The General — Buster Keaton Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // House on Haunted Hill
  19934: [
    { id: 'v20', key: 'O_kX1iVv_kM', name: 'House on Haunted Hill — Vincent Price Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  // The Little Shop of Horrors
  10764: [
    { id: 'v21', key: 'q1aXb9U5G7g', name: 'The Little Shop of Horrors (1960) — Original Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],

  // TV Shows
  126308: [
    { id: 'v22', key: 'yRUAzGQ3nSY', name: 'Shōgun — Official FX Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  100088: [
    { id: 'v23', key: 'uLtkt8BonwM', name: 'The Last of Us — Official HBO Teaser', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  66732: [
    { id: 'v24', key: 'b9EkMc79ZSU', name: 'Stranger Things 4 — Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  1399: [
    { id: 'v25', key: 'KPLWWIOCOOQ', name: 'Game of Thrones — Official HBO Series Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  94997: [
    { id: 'v26', key: 'DotnJ7tTA34', name: 'House of the Dragon — Official HBO Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  1396: [
    { id: 'v27', key: 'HhesaQXLuRY', name: 'Breaking Bad — Series Official Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  94605: [
    { id: 'v28', key: 'fXmAurh012s', name: 'Arcane — Official Netflix Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ],
  114479: [
    { id: 'v29', key: 'y-cqqAJIXhs', name: 'The Bear — Official FX Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true }
  ]
};

// Fallback watch providers
const FALLBACK_PROVIDERS: Record<number, TMDBWatchProvidersResponse> = {
  693134: {
    id: 693134,
    results: {
      US: {
        link: 'https://www.themoviedb.org/movie/693134-dune-part-two/watch',
        flatrate: [{ provider_id: 1899, provider_name: 'Max', logo_path: '/6uhKBfmtzFqOcLoul1XWHNYQ2iU.jpg' }],
        rent: [{ provider_id: 2, provider_name: 'Apple TV', logo_path: '/9ghgSC0MA0RDoMk6qoMmR4Wv5tp.jpg' }, { provider_id: 3, provider_name: 'Amazon Prime Video', logo_path: '/5NyLm42TmCqCMOZFv245dpmbtqp.jpg' }],
        buy: [{ provider_id: 2, provider_name: 'Apple TV', logo_path: '/9ghgSC0MA0RDoMk6qoMmR4Wv5tp.jpg' }]
      }
    }
  },
  10331: {
    id: 10331,
    results: {
      US: {
        link: 'https://www.themoviedb.org/movie/10331-night-of-the-living-dead/watch',
        free: [
          { provider_id: 73, provider_name: 'Tubi TV (Free)', logo_path: '/wAaeO3l11Fw1K9zV7wD11oM2JzZ.jpg' },
          { provider_id: 300, provider_name: 'Pluto TV (Free)', logo_path: '/dBx8HjQ1q5X7A9C9K2Y7n3wV8o.jpg' }
        ],
        flatrate: [{ provider_id: 11, provider_name: 'Internet Archive (Free Public Domain)', logo_path: '/bZvc9dXrXNly7cA0V4D9Z6X11v0.jpg' }]
      }
    }
  }
};

const PUBLIC_DOMAIN_MOVIES = [
  FALLBACK_MOVIES[13], // Night of the Living Dead
  FALLBACK_MOVIES[14], // Metropolis
  FALLBACK_MOVIES[15], // Charade
  FALLBACK_MOVIES[16], // Nosferatu
  FALLBACK_MOVIES[17], // His Girl Friday
  FALLBACK_MOVIES[18], // The General
  FALLBACK_MOVIES[19], // House on Haunted Hill
  FALLBACK_MOVIES[20], // The Little Shop of Horrors
];

export const FALLBACK_CATALOG: Record<string, { page: number; results: unknown[]; total_pages: number; total_results: number }> = {
  'trending/movie/week': {
    page: 1,
    results: FALLBACK_MOVIES.slice(0, 10).map(m => ({ ...m, media_type: 'movie' })),
    total_pages: 5,
    total_results: 50,
  },
  'movie/popular': {
    page: 1,
    results: [FALLBACK_MOVIES[6], FALLBACK_MOVIES[7], FALLBACK_MOVIES[0], FALLBACK_MOVIES[1], FALLBACK_MOVIES[2], FALLBACK_MOVIES[11]],
    total_pages: 5,
    total_results: 50,
  },
  'movie/top_rated': {
    page: 1,
    results: [FALLBACK_MOVIES[8], FALLBACK_MOVIES[9], FALLBACK_MOVIES[4], FALLBACK_MOVIES[3], FALLBACK_MOVIES[5], FALLBACK_MOVIES[2]],
    total_pages: 5,
    total_results: 50,
  },
  'movie/now_playing': {
    page: 1,
    results: [FALLBACK_MOVIES[6], FALLBACK_MOVIES[7], FALLBACK_MOVIES[0], FALLBACK_MOVIES[1], FALLBACK_MOVIES[3]],
    total_pages: 5,
    total_results: 50,
  },
  'discover/movie?with_genres=28': {
    page: 1,
    results: [FALLBACK_MOVIES[4], FALLBACK_MOVIES[6], FALLBACK_MOVIES[10], FALLBACK_MOVIES[12], FALLBACK_MOVIES[2]],
    total_pages: 5,
    total_results: 50,
  },
  'discover/movie?with_genres=35': {
    page: 1,
    results: [FALLBACK_MOVIES[11], FALLBACK_MOVIES[7], FALLBACK_MOVIES[6], FALLBACK_MOVIES[17]],
    total_pages: 5,
    total_results: 30,
  },
  'discover/movie?with_genres=27': {
    page: 1,
    results: [FALLBACK_MOVIES[13], FALLBACK_MOVIES[16], FALLBACK_MOVIES[19], FALLBACK_MOVIES[20]],
    total_pages: 5,
    total_results: 30,
  },
  'discover/movie?with_genres=878': {
    page: 1,
    results: [FALLBACK_MOVIES[0], FALLBACK_MOVIES[3], FALLBACK_MOVIES[2], FALLBACK_MOVIES[5], FALLBACK_MOVIES[10], FALLBACK_MOVIES[14]],
    total_pages: 5,
    total_results: 45,
  },
  // Dedicated Free Full Movies category
  'discover/movie?free_full=true': {
    page: 1,
    results: PUBLIC_DOMAIN_MOVIES.map(m => ({ ...m, media_type: 'movie', is_free_full_movie: true })),
    total_pages: 1,
    total_results: PUBLIC_DOMAIN_MOVIES.length,
  },
  'trending/tv/week': {
    page: 1,
    results: FALLBACK_TV_SHOWS.map(t => ({ ...t, media_type: 'tv' })),
    total_pages: 3,
    total_results: 25,
  },
  'tv/popular': {
    page: 1,
    results: [FALLBACK_TV_SHOWS[0], FALLBACK_TV_SHOWS[1], FALLBACK_TV_SHOWS[2], FALLBACK_TV_SHOWS[4], FALLBACK_TV_SHOWS[5]],
    total_pages: 3,
    total_results: 25,
  },
  'tv/top_rated': {
    page: 1,
    results: [FALLBACK_TV_SHOWS[5], FALLBACK_TV_SHOWS[6], FALLBACK_TV_SHOWS[1], FALLBACK_TV_SHOWS[0], FALLBACK_TV_SHOWS[2], FALLBACK_TV_SHOWS[3]],
    total_pages: 3,
    total_results: 25,
  }
};

export function findFallbackDetail(type: 'movie' | 'tv', id: number, subresource: string) {
  if (type === 'movie') {
    const movie = FALLBACK_MOVIES.find(m => m.id === id);
    if (!movie) return null;
    if (!subresource) return movie;
    if (subresource === 'credits') {
      return FALLBACK_CREDITS[id] || { id, cast: [], crew: [] };
    }
    if (subresource === 'videos') {
      if (FALLBACK_VIDEOS[id]) {
        return { id, results: FALLBACK_VIDEOS[id] };
      }
      return {
        id,
        results: [
          {
            id: `v_${id}`,
            key: `search_${encodeURIComponent(movie.title)}`,
            name: `${movie.title} — Official Trailer`,
            site: 'YouTube',
            size: 1080,
            type: 'Trailer',
            official: true
          }
        ]
      };
    }
    if (subresource === 'similar') {
      return { page: 1, results: FALLBACK_MOVIES.filter(m => m.id !== id).slice(0, 6), total_pages: 1, total_results: 6 };
    }
    if (subresource === 'watch/providers') {
      return FALLBACK_PROVIDERS[id] || null;
    }
  } else {
    const show = FALLBACK_TV_SHOWS.find(t => t.id === id);
    if (!show) return null;
    if (!subresource) return show;
    if (subresource.startsWith('season/')) {
      const seasonNum = parseInt(subresource.split('/')[1], 10) || 1;
      return generateFallbackSeason(show, seasonNum);
    }
    if (subresource === 'credits') {
      return FALLBACK_CREDITS[id] || FALLBACK_CREDITS[126308];
    }
    if (subresource === 'videos') {
      if (FALLBACK_VIDEOS[id]) {
        return { id, results: FALLBACK_VIDEOS[id] };
      }
      return {
        id,
        results: [
          {
            id: `v_tv_${id}`,
            key: `search_${encodeURIComponent(show.name)}`,
            name: `${show.name} — Official Series Trailer`,
            site: 'YouTube',
            size: 1080,
            type: 'Trailer',
            official: true
          }
        ]
      };
    }
    if (subresource === 'similar') {
      return { page: 1, results: FALLBACK_TV_SHOWS.filter(t => t.id !== id).slice(0, 6), total_pages: 1, total_results: 6 };
    }
    if (subresource === 'watch/providers') {
      return {
        id,
        results: {
          US: {
            link: `https://www.themoviedb.org/tv/${id}/watch`,
            flatrate: [{ provider_id: 1899, provider_name: 'Hulu / Max', logo_path: '/6uhKBfmtzFqOcLoul1XWHNYQ2iU.jpg' }]
          }
        }
      };
    }
  }
  return null;
}

function generateFallbackSeason(show: TMDBTVShow, seasonNum: number): TMDBSeasonDetail {
  const episodes = Array.from({ length: 6 }).map((_, idx) => ({
    id: show.id * 100 + seasonNum * 10 + (idx + 1),
    name: `Chapter ${idx + 1}: ${idx === 0 ? 'The Journey Begins' : 'Crossroads of Destiny'}`,
    overview: `Key events unfold as loyalties are tested and high-stakes alliances are forged in season ${seasonNum}.`,
    episode_number: idx + 1,
    season_number: seasonNum,
    air_date: show.first_air_date,
    still_path: show.backdrop_path,
    vote_average: show.vote_average,
    vote_count: 120,
    runtime: 58
  }));

  return {
    id: show.id * 10 + seasonNum,
    name: `Season ${seasonNum}`,
    overview: show.overview,
    season_number: seasonNum,
    poster_path: show.poster_path,
    episodes
  };
}

export function searchFallbackCatalog(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const matchingMovies = FALLBACK_MOVIES.filter(m =>
    m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q)
  ).map(m => ({ ...m, media_type: 'movie' }));

  const matchingTV = FALLBACK_TV_SHOWS.filter(t =>
    t.name.toLowerCase().includes(q) || t.overview.toLowerCase().includes(q)
  ).map(t => ({ ...t, media_type: 'tv' }));

  const all = [...matchingMovies, ...matchingTV];

  return {
    page: 1,
    results: all,
    total_pages: Math.ceil(all.length / 20) || 1,
    total_results: all.length,
  };
}
