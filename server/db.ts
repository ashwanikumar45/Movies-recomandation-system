import fs from 'fs';
import path from 'path';
import { Movie, User, Interaction, WatchlistItem, RecommenderWeights } from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'cinema_db.json');

export interface DatabaseSchema {
  users: User[];
  movies: Movie[];
  interactions: Interaction[];
  watchlists: WatchlistItem[];
  userWeights: Record<string, RecommenderWeights>;
}

// 3 Default Personas for Real-Time Testing
const DEFAULT_USERS: User[] = [
  {
    id: 'user_maya',
    name: 'Maya Lin',
    tagline: 'Sci-Fi & Cyberpunk Critic',
    bio: 'Obsessed with existential hard sci-fi, dystopian futures, synth soundtracks, and high-concept artificial intelligence narratives.',
    avatarUrl: '/src/assets/images/avatar_scifi_maya_1793551990258.jpg',
    favoriteGenres: ['Science Fiction', 'Mystery', 'Drama', 'Adventure'],
    dislikedGenres: ['Romance', 'Comedy', 'Musical'],
    aesthetic: 'Neon Cyberpunk / Deep Cosmos',
    primaryColor: '#06b6d4',
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    tagline: 'Psychological Thriller & Noir Buff',
    bio: 'Drawn to moral ambiguity, high-stakes detective procedurals, unreliable narrators, slow-burn tension, and gritty neo-noir realism.',
    avatarUrl: '/src/assets/images/avatar_noir_marcus_1793551989889.jpg',
    favoriteGenres: ['Thriller', 'Crime', 'Mystery', 'Drama'],
    dislikedGenres: ['Animation', 'Family', 'Fantasy'],
    aesthetic: 'Shadow Noir / Gritty Steel',
    primaryColor: '#f59e0b',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    tagline: 'Indie Romance & Poetic Cinema',
    bio: 'Loves lyrical storytelling, poignant emotional intimacy, Studio Ghibli magic, French new wave sensibilities, and tender human drama.',
    avatarUrl: '/src/assets/images/avatar_indie_elena_1793551991137.jpg',
    favoriteGenres: ['Romance', 'Drama', 'Animation', 'Fantasy'],
    dislikedGenres: ['Horror', 'Action', 'War'],
    aesthetic: 'Golden Hour / Pastoral Indie',
    primaryColor: '#ec4899',
  },
];

// Rich diverse initial movie catalog with real TMDB assets and YouTube trailer IDs
const INITIAL_MOVIES: Movie[] = [
  {
    "id": "m_dune2",
    "tmdbId": 693134,
    "title": "Dune: Part Two",
    "overview": "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    "genres": [
      "Science Fiction",
      "Adventure",
      "Drama"
    ],
    "releaseDate": "2024-02-27",
    "releaseYear": 2024,
    "posterPath": "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
    "voteAverage": 8.2,
    "voteCount": 5600,
    "runtime": 166,
    "director": "Denis Villeneuve",
    "cast": [
      "Timothée Chalamet",
      "Zendaya",
      "Rebecca Ferguson",
      "Austin Butler"
    ],
    "keywords": [
      "desert",
      "prophecy",
      "spice",
      "epic",
      "messiah",
      "worms",
      "outer space"
    ],
    "trailerKey": "Way9Dexny3w",
    "popularity": 92.5
  },
  {
    "id": "m_br2049",
    "tmdbId": 335984,
    "title": "Blade Runner 2049",
    "overview": "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what is left of society into chaos.",
    "genres": [
      "Science Fiction",
      "Mystery",
      "Drama"
    ],
    "releaseDate": "2017-10-04",
    "releaseYear": 2017,
    "posterPath": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg",
    "voteAverage": 8,
    "voteCount": 13200,
    "runtime": 164,
    "director": "Denis Villeneuve",
    "cast": [
      "Ryan Gosling",
      "Harrison Ford",
      "Ana de Armas",
      "Sylvia Hoeks"
    ],
    "keywords": [
      "cyberpunk",
      "android",
      "artificial intelligence",
      "dystopia",
      "neon",
      "existential"
    ],
    "trailerKey": "gCcx85zbxz4",
    "popularity": 88
  },
  {
    "id": "m_interstellar",
    "tmdbId": 157336,
    "title": "Interstellar",
    "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    "genres": [
      "Adventure",
      "Drama",
      "Science Fiction"
    ],
    "releaseDate": "2014-11-05",
    "releaseYear": 2014,
    "posterPath": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
    "voteAverage": 8.4,
    "voteCount": 35000,
    "runtime": 169,
    "director": "Christopher Nolan",
    "cast": [
      "Matthew McConaughey",
      "Anne Hathaway",
      "Jessica Chastain",
      "Michael Caine"
    ],
    "keywords": [
      "wormhole",
      "black hole",
      "time dilation",
      "space exploration",
      "gravity",
      "father daughter"
    ],
    "trailerKey": "zSWdZVtXT7E",
    "popularity": 94
  },
  {
    "id": "m_arrival",
    "tmdbId": 329865,
    "title": "Arrival",
    "overview": "Taking place after alien spacecrafts touch down across the world, an elite team led by linguist Louise Banks is brought together to investigate in a race against global war.",
    "genres": [
      "Science Fiction",
      "Mystery",
      "Drama"
    ],
    "releaseDate": "2016-11-10",
    "releaseYear": 2016,
    "posterPath": "https://image.tmdb.org/t/p/w500/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/8MUZz7oPXQftFTslZpRP3CVMOoq.jpg",
    "voteAverage": 7.9,
    "voteCount": 17200,
    "runtime": 116,
    "director": "Denis Villeneuve",
    "cast": [
      "Amy Adams",
      "Jeremy Renner",
      "Forest Whitaker",
      "Michael Stuhlbarg"
    ],
    "keywords": [
      "alien contact",
      "linguistics",
      "non-linear time",
      "heptapods",
      "philosophy"
    ],
    "trailerKey": "tFMo3UJ4B4g",
    "popularity": 81
  },
  {
    "id": "m_matrix",
    "tmdbId": 603,
    "title": "The Matrix",
    "overview": "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    "genres": [
      "Action",
      "Science Fiction"
    ],
    "releaseDate": "1999-03-30",
    "releaseYear": 1999,
    "posterPath": "https://image.tmdb.org/t/p/w500/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg",
    "voteAverage": 8.2,
    "voteCount": 25400,
    "runtime": 136,
    "director": "Lana & Lilly Wachowski",
    "cast": [
      "Keanu Reeves",
      "Laurence Fishburne",
      "Carrie-Anne Moss",
      "Hugo Weaving"
    ],
    "keywords": [
      "simulated reality",
      "cyberpunk",
      "kung fu",
      "dystopia",
      "chosen one",
      "red pill"
    ],
    "trailerKey": "vKQi3bBA1y8",
    "popularity": 87.5
  },
  {
    "id": "m_ex_machina",
    "tmdbId": 264660,
    "title": "Ex Machina",
    "overview": "Celebrated programmer Caleb Smith wins a competition to spend a week at the private mountain estate of Nathan Bateman, the brilliant CEO of the tech company he works for, to administer a Turing test to an intelligent humanoid robot.",
    "genres": [
      "Drama",
      "Science Fiction"
    ],
    "releaseDate": "2015-01-21",
    "releaseYear": 2015,
    "posterPath": "https://image.tmdb.org/t/p/w500/dmJW8IAKHKxFNiUnoDR7JfsK7Rp.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/uqOuJ50EtTj7kkDIXP8LCg7G45D.jpg",
    "voteAverage": 7.6,
    "voteCount": 13100,
    "runtime": 108,
    "director": "Alex Garland",
    "cast": [
      "Alicia Vikander",
      "Domhnall Gleeson",
      "Oscar Isaac",
      "Sonoya Mizuno"
    ],
    "keywords": [
      "artificial intelligence",
      "turing test",
      "isolation",
      "manipulation",
      "robotics"
    ],
    "trailerKey": "EoQuVnKhxaM",
    "popularity": 76
  },
  {
    "id": "m_se7en",
    "tmdbId": 807,
    "title": "Se7en",
    "overview": "Two homicide detectives are on a desperate hunt for a serial killer whose crimes are based on the \"seven deadly sins\" in this dark and haunting film that takes viewers from the tortured remains of one victim to the next.",
    "genres": [
      "Crime",
      "Mystery",
      "Thriller"
    ],
    "releaseDate": "1995-09-22",
    "releaseYear": 1995,
    "posterPath": "https://image.tmdb.org/t/p/w500/191nKfP0ehp3uIvWqgPbFmI4lv9.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/i5H7zusQGsysGQ8i6P361Vnr0n2.jpg",
    "voteAverage": 8.4,
    "voteCount": 20800,
    "runtime": 127,
    "director": "David Fincher",
    "cast": [
      "Brad Pitt",
      "Morgan Freeman",
      "Gwyneth Paltrow",
      "Kevin Spacey"
    ],
    "keywords": [
      "seven deadly sins",
      "serial killer",
      "detective",
      "rainy city",
      "dark psychological"
    ],
    "trailerKey": "znmZoVkCjpI",
    "popularity": 89
  },
  {
    "id": "m_zodiac",
    "tmdbId": 1949,
    "title": "Zodiac",
    "overview": "A cartoonist teams up with an ace reporter and a law enforcement officer to solve the mystery of the Zodiac Killer, a real-life serial murderer who terrorized the San Francisco Bay Area in the late 1960s and 1970s.",
    "genres": [
      "Crime",
      "Drama",
      "Mystery",
      "Thriller"
    ],
    "releaseDate": "2007-03-02",
    "releaseYear": 2007,
    "posterPath": "https://image.tmdb.org/t/p/w500/6YmeO4pB7XTh8P8F960O1uA14JO.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/3zCPI4JFc54xvLaJ71oI2KoP3az.jpg",
    "voteAverage": 7.6,
    "voteCount": 10500,
    "runtime": 157,
    "director": "David Fincher",
    "cast": [
      "Jake Gyllenhaal",
      "Mark Ruffalo",
      "Robert Downey Jr.",
      "Anthony Edwards"
    ],
    "keywords": [
      "investigation",
      "journalism",
      "obsession",
      "unsolved crimes",
      "true crime"
    ],
    "trailerKey": "yNncHPl1UXg",
    "popularity": 78.5
  },
  {
    "id": "m_shutter_island",
    "tmdbId": 11324,
    "title": "Shutter Island",
    "overview": "World War II soldier-turned-U.S. Marshal Teddy Daniels investigates the disappearance of a patient from Boston's Shutter Island Ashecliffe Hospital, uncovering dark secrets in an offshore asylum.",
    "genres": [
      "Drama",
      "Mystery",
      "Thriller"
    ],
    "releaseDate": "2010-02-14",
    "releaseYear": 2010,
    "posterPath": "https://image.tmdb.org/t/p/w500/nrmXQ0zcZUL8jFLrakWc90IR8z9.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/lavdyiJWciCJvyLG37ZOs6HJijg.jpg",
    "voteAverage": 8.2,
    "voteCount": 23600,
    "runtime": 138,
    "director": "Martin Scorsese",
    "cast": [
      "Leonardo DiCaprio",
      "Mark Ruffalo",
      "Ben Kingsley",
      "Michelle Williams"
    ],
    "keywords": [
      "psychiatric hospital",
      "twist ending",
      "psychological illusion",
      "guilt",
      "storm"
    ],
    "trailerKey": "5iaYLCiq5RM",
    "popularity": 86
  },
  {
    "id": "m_prisoners",
    "tmdbId": 146233,
    "title": "Prisoners",
    "overview": "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads and the pressure mounts.",
    "genres": [
      "Drama",
      "Thriller",
      "Crime",
      "Mystery"
    ],
    "releaseDate": "2013-09-18",
    "releaseYear": 2013,
    "posterPath": "https://image.tmdb.org/t/p/w500/uhviyknTT5cEQXbn6vWIqfM4vGm.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/3RFmTz5h2UuFWEV4oH00XICBR9y.jpg",
    "voteAverage": 8.1,
    "voteCount": 12200,
    "runtime": 153,
    "director": "Denis Villeneuve",
    "cast": [
      "Hugh Jackman",
      "Jake Gyllenhaal",
      "Viola Davis",
      "Paul Dano"
    ],
    "keywords": [
      "kidnapping",
      "moral boundaries",
      "detective",
      "vigilante",
      "cold winter"
    ],
    "trailerKey": "bpXfcT61cuU",
    "popularity": 80
  },
  {
    "id": "m_memento",
    "tmdbId": 77,
    "title": "Memento",
    "overview": "Leonard Shelby is tracking down the man who raped and murdered his wife. The difficulty of locating his wife's killer, however, is compounded by the fact that he suffers from an untreatable form of short-term memory loss.",
    "genres": [
      "Mystery",
      "Thriller"
    ],
    "releaseDate": "2000-10-11",
    "releaseYear": 2000,
    "posterPath": "https://image.tmdb.org/t/p/w500/nzlv62aC0octS5AklAiWpXLX9Z0.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/7Wev9JMo6R5XAfz2KDvXb7oPMmy.jpg",
    "voteAverage": 8.2,
    "voteCount": 14700,
    "runtime": 113,
    "director": "Christopher Nolan",
    "cast": [
      "Guy Pearce",
      "Carrie-Anne Moss",
      "Joe Pantoliano",
      "Mark Boone Junior"
    ],
    "keywords": [
      "amnesia",
      "polaroid",
      "reverse chronology",
      "deception",
      "paranoia"
    ],
    "trailerKey": "4CV41hoyS8A",
    "popularity": 79
  },
  {
    "id": "m_nightcrawler",
    "tmdbId": 242582,
    "title": "Nightcrawler",
    "overview": "When Lou Bloom, a driven man desperate for work, muscles into the world of L.A. crime journalism, he blurs the line between observer and participant to become the star of his own story.",
    "genres": [
      "Crime",
      "Drama",
      "Thriller"
    ],
    "releaseDate": "2014-10-23",
    "releaseYear": 2014,
    "posterPath": "https://image.tmdb.org/t/p/w500/j9HrX8f7GbZQm1BrBiR40uFQZSb.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/aCnpRvVBqltC8ZuVP67C4fdUCb4.jpg",
    "voteAverage": 7.7,
    "voteCount": 10800,
    "runtime": 117,
    "director": "Dan Gilroy",
    "cast": [
      "Jake Gyllenhaal",
      "Rene Russo",
      "Riz Ahmed",
      "Bill Paxton"
    ],
    "keywords": [
      "sociopath",
      "tabloid news",
      "nighttime Los Angeles",
      "ambition",
      "cynical"
    ],
    "trailerKey": "u1uP_8cP_B0",
    "popularity": 75
  },
  {
    "id": "m_past_lives",
    "tmdbId": 666277,
    "title": "Past Lives",
    "overview": "Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora's family emigrates from South Korea. Decades later, they are reunited for one fateful week in New York.",
    "genres": [
      "Romance",
      "Drama"
    ],
    "releaseDate": "2023-06-02",
    "releaseYear": 2023,
    "posterPath": "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/7HR38hMBl23lf38MAN63y4pKsHz.jpg",
    "voteAverage": 7.8,
    "voteCount": 2200,
    "runtime": 106,
    "director": "Celine Song",
    "cast": [
      "Greta Lee",
      "Teo Yoo",
      "John Magaro",
      "Moon Seung-ah"
    ],
    "keywords": [
      "in-yun",
      "childhood sweethearts",
      "reunion",
      "fate",
      "melancholy",
      "new york"
    ],
    "trailerKey": "kA244xewjcI",
    "popularity": 77
  },
  {
    "id": "m_before_sunrise",
    "tmdbId": 76,
    "title": "Before Sunrise",
    "overview": "A young man and an American tourist in Europe meet on a train from Budapest to Vienna and decide to disembark together, spending a single nocturnal evening conversing about life and love.",
    "genres": [
      "Drama",
      "Romance"
    ],
    "releaseDate": "1995-01-27",
    "releaseYear": 1995,
    "posterPath": "https://image.tmdb.org/t/p/w500/kf1Jb1c2JAOqjuzA3H4oDM263uB.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/qA2TyqPldTtoTVY3LKrNIG5g6bH.jpg",
    "voteAverage": 8,
    "voteCount": 4300,
    "runtime": 105,
    "director": "Richard Linklater",
    "cast": [
      "Ethan Hawke",
      "Julie Delpy",
      "Andrea Eckert",
      "Hanno Pöschl"
    ],
    "keywords": [
      "vienna",
      "dialogue-driven",
      "wandering",
      "first love",
      "philosophy of romance"
    ],
    "trailerKey": "25v7N34d5HE",
    "popularity": 74
  },
  {
    "id": "m_spirited_away",
    "tmdbId": 129,
    "title": "Spirited Away",
    "overview": "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free herself and her family.",
    "genres": [
      "Animation",
      "Family",
      "Fantasy"
    ],
    "releaseDate": "2001-07-20",
    "releaseYear": 2001,
    "posterPath": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg",
    "voteAverage": 8.5,
    "voteCount": 16000,
    "runtime": 125,
    "director": "Hayao Miyazaki",
    "cast": [
      "Rumi Hiiragi",
      "Miyu Irino",
      "Mari Natsuki",
      "Takashi Naito"
    ],
    "keywords": [
      "bathhouse",
      "spirits",
      "ghibli",
      "courage",
      "japanese mythology",
      "nostalgia"
    ],
    "trailerKey": "ByXuk9QqQkk",
    "popularity": 88
  },
  {
    "id": "m_portrait_lady",
    "tmdbId": 531428,
    "title": "Portrait of a Lady on Fire",
    "overview": "On an isolated island in Brittany at the end of the eighteenth century, a female painter is obliged to paint a wedding portrait of a young woman without her knowledge.",
    "genres": [
      "Drama",
      "Romance",
      "History"
    ],
    "releaseDate": "2019-06-17",
    "releaseYear": 2019,
    "posterPath": "https://image.tmdb.org/t/p/w500/2LquGwEhbg3soxSCs9VNyh5VJd9.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/ivJ5UzT6IzucLVfbZwCCwiJJoBz.jpg",
    "voteAverage": 8.1,
    "voteCount": 2600,
    "runtime": 122,
    "director": "Céline Sciamma",
    "cast": [
      "Noémie Merlant",
      "Adèle Haenel",
      "Luàna Bajrami",
      "Valeria Golino"
    ],
    "keywords": [
      "gaze",
      "painting",
      "forbidden love",
      "ocean waves",
      "artistic intimacy"
    ],
    "trailerKey": "R-fQPT42Q80",
    "popularity": 73
  },
  {
    "id": "m_amelie",
    "tmdbId": 194,
    "title": "Amélie",
    "overview": "Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.",
    "genres": [
      "Comedy",
      "Romance"
    ],
    "releaseDate": "2001-04-25",
    "releaseYear": 2001,
    "posterPath": "https://image.tmdb.org/t/p/w500/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/6n53UI4mX9QMfe2S0Pgt8mGebY1.jpg",
    "voteAverage": 8,
    "voteCount": 11200,
    "runtime": 122,
    "director": "Jean-Pierre Jeunet",
    "cast": [
      "Audrey Tautou",
      "Mathieu Kassovitz",
      "Rufus",
      "Lorella Cravotta"
    ],
    "keywords": [
      "montmartre",
      "whimsical",
      "altruism",
      "paris",
      "quirky imagination"
    ],
    "trailerKey": "HUECWi5pX7o",
    "popularity": 77
  },
  {
    "id": "m_her",
    "tmdbId": 152601,
    "title": "Her",
    "overview": "In a near future Los Angeles, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need.",
    "genres": [
      "Romance",
      "Science Fiction",
      "Drama"
    ],
    "releaseDate": "2013-12-18",
    "releaseYear": 2013,
    "posterPath": "https://image.tmdb.org/t/p/w500/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/1YnZchmaGc8dchgRPDpR1KGrixA.jpg",
    "voteAverage": 7.9,
    "voteCount": 14000,
    "runtime": 126,
    "director": "Spike Jonze",
    "cast": [
      "Joaquin Phoenix",
      "Scarlett Johansson",
      "Amy Adams",
      "Rooney Mara"
    ],
    "keywords": [
      "operating system",
      "loneliness",
      "pastel future",
      "artificial intelligence",
      "heartbreak"
    ],
    "trailerKey": "ne6p6PQTr38",
    "popularity": 81.5
  },
  {
    "id": "m_oppenheimer",
    "tmdbId": 872585,
    "title": "Oppenheimer",
    "overview": "The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, confronting the paradox of risking destruction to save civilization.",
    "genres": [
      "Drama",
      "History"
    ],
    "releaseDate": "2023-07-19",
    "releaseYear": 2023,
    "posterPath": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
    "voteAverage": 8.1,
    "voteCount": 9200,
    "runtime": 180,
    "director": "Christopher Nolan",
    "cast": [
      "Cillian Murphy",
      "Emily Blunt",
      "Matt Damon",
      "Robert Downey Jr."
    ],
    "keywords": [
      "manhattan project",
      "quantum physics",
      "trinity test",
      "red scare",
      "guilt"
    ],
    "trailerKey": "uYPbbksJxIg",
    "popularity": 91
  },
  {
    "id": "m_parasite",
    "tmdbId": 496243,
    "title": "Parasite",
    "overview": "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    "genres": [
      "Comedy",
      "Thriller",
      "Drama"
    ],
    "releaseDate": "2019-05-30",
    "releaseYear": 2019,
    "posterPath": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    "voteAverage": 8.5,
    "voteCount": 18100,
    "runtime": 132,
    "director": "Bong Joon-ho",
    "cast": [
      "Song Kang-ho",
      "Lee Sun-kyun",
      "Cho Yeo-jeong",
      "Choi Woo-shik"
    ],
    "keywords": [
      "class struggle",
      "basement",
      "con artists",
      "architecture",
      "rain storm"
    ],
    "trailerKey": "5xH0R_ux3gk",
    "popularity": 89.5
  },
  {
    "id": "m_eeaao",
    "tmdbId": 580489,
    "title": "Everything Everywhere All at Once",
    "overview": "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what is important to her by connecting with the lives she could have led in other universes.",
    "genres": [
      "Action",
      "Adventure",
      "Science Fiction"
    ],
    "releaseDate": "2022-03-24",
    "releaseYear": 2022,
    "posterPath": "https://image.tmdb.org/t/p/w500/pzKsRuKLFmYrW5Q0q8E8G78Tcgo.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/eENEf62tMXbhyVvdcXlnQz2wcuT.jpg",
    "voteAverage": 7.8,
    "voteCount": 6500,
    "runtime": 139,
    "director": "Daniel Kwan, Daniel Scheinert",
    "cast": [
      "Michelle Yeoh",
      "Ke Huy Quan",
      "Stephanie Hsu",
      "Jamie Lee Curtis"
    ],
    "keywords": [
      "multiverse",
      "taxes",
      "bagel",
      "mother daughter",
      "absurdist comedy",
      "martial arts"
    ],
    "trailerKey": "wxN1T1uxQ2g",
    "popularity": 83
  },
  {
    "id": "m_drive_my_car",
    "tmdbId": 773867,
    "title": "Drive My Car",
    "overview": "Yusuke Kafuku, an aging stage actor and director, is offered to direct Uncle Vanya at a theater festival in Hiroshima. There, he meets Misaki Watari, a taciturn young woman appointed to be his chauffeur.",
    "genres": [
      "Drama",
      "Romance"
    ],
    "releaseDate": "2021-08-18",
    "releaseYear": 2021,
    "posterPath": "https://image.tmdb.org/t/p/w500/txaOvJ6HURmqFbpVtJezWNWqaR4.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/rHzoz94bRfyfNLjiIB26Wt5KDHE.jpg",
    "voteAverage": 7.7,
    "voteCount": 1200,
    "runtime": 179,
    "director": "Ryusuke Hamaguchi",
    "cast": [
      "Hidetoshi Nishijima",
      "Toko Miura",
      "Masaki Okada",
      "Reika Kirishima"
    ],
    "keywords": [
      "saab 900",
      "chekhov",
      "grief",
      "car drives",
      "multilingual theater"
    ],
    "trailerKey": "6B4v_7tBqRk",
    "popularity": 70
  },
  {
    "id": "m_solaris",
    "tmdbId": 593,
    "title": "Solaris",
    "overview": "A psychologist is sent to a space station orbiting a mysterious planet to investigate the bizarre emotional breakdown of the crew, finding his dead wife seemingly materialized beside him.",
    "genres": [
      "Drama",
      "Science Fiction",
      "Mystery"
    ],
    "releaseDate": "1972-03-20",
    "releaseYear": 1972,
    "posterPath": "https://image.tmdb.org/t/p/w500/pgqj7QoBPWFLLKtLEpPmFYFRMgB.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/hMuDvMZ9oKEcQw340iru3ol8dxl.jpg",
    "voteAverage": 7.8,
    "voteCount": 1600,
    "runtime": 167,
    "director": "Andrei Tarkovsky",
    "cast": [
      "Donatas Banionis",
      "Natalya Bondarchuk",
      "Jüri Järvet",
      "Vladislav Dvorzhetsky"
    ],
    "keywords": [
      "ocean planet",
      "hallucination",
      "philosophical",
      "tarkovsky",
      "memory",
      "guilt"
    ],
    "trailerKey": "6-4KydP92ss",
    "popularity": 68
  },
  {
    "id": "m_chinatown",
    "tmdbId": 329,
    "title": "Chinatown",
    "overview": "Private eye J.J. Gittes is hired by a woman claiming to be Mrs. Mulwray to spy on her husband. When the real Mrs. Mulwray appears, Gittes gets trapped in a web of deceit and political corruption in 1930s Los Angeles.",
    "genres": [
      "Crime",
      "Drama",
      "Mystery",
      "Thriller"
    ],
    "releaseDate": "1974-06-20",
    "releaseYear": 1974,
    "posterPath": "https://image.tmdb.org/t/p/w500/d9mtMGQDLANKieb9PbD3yK7xxzo.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/4SyDTF02R5BepqSdQmOaNCHObzF.jpg",
    "voteAverage": 7.9,
    "voteCount": 3700,
    "runtime": 130,
    "director": "Roman Polanski",
    "cast": [
      "Jack Nicholson",
      "Faye Dunaway",
      "John Huston",
      "Perry Lopez"
    ],
    "keywords": [
      "water scandal",
      "private detective",
      "film noir",
      "corruption",
      "tragic truth"
    ],
    "trailerKey": "3a0rB6Y1z5k",
    "popularity": 72
  },
  {
    "id": "m_rrr",
    "tmdbId": 579974,
    "title": "RRR (Hindi Dubbed)",
    "overview": "A fearless revolutionary and an officer in the British force, who once shared an unbreakable bond, join forces against the British colonial empire in this thunderous action epic.",
    "genres": [
      "Action",
      "Drama",
      "South (Hindi Dubbed)",
      "History"
    ],
    "releaseDate": "2022-03-24",
    "releaseYear": 2022,
    "posterPath": "https://image.tmdb.org/t/p/w500/wE0I6efAW4cDDmZQWtwZMOW44EJ.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg",
    "voteAverage": 7.8,
    "voteCount": 1700,
    "runtime": 182,
    "director": "S.S. Rajamouli",
    "cast": [
      "N.T. Rama Rao Jr.",
      "Ram Charan",
      "Ajay Devgn",
      "Alia Bhatt"
    ],
    "keywords": [
      "south indian",
      "hindi dubbed",
      "revolution",
      "friendship",
      "freedom fighter",
      "action epic"
    ],
    "trailerKey": "NgBoMJy386M",
    "popularity": 95
  },
  {
    "id": "m_kgf2",
    "tmdbId": 585245,
    "title": "K.G.F: Chapter 2 (Hindi Dubbed)",
    "overview": "The blood-soaked land of Kolar Gold Fields has a new overlord now - Rocky, whose name strikes fear in the heart of his foes as he battles ruthless assassins and government forces.",
    "genres": [
      "Action",
      "Crime",
      "Thriller",
      "South (Hindi Dubbed)"
    ],
    "releaseDate": "2022-04-14",
    "releaseYear": 2022,
    "posterPath": "https://image.tmdb.org/t/p/w500/30ULVKdjBcQTsj2aOSThXXZNSxF.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/zBkHCpLmHjW2uVURs5uZkaVmgKR.jpg",
    "voteAverage": 7.5,
    "voteCount": 750,
    "runtime": 168,
    "director": "Prashanth Neel",
    "cast": [
      "Yash",
      "Sanjay Dutt",
      "Raveena Tandon",
      "Srinidhi Shetty"
    ],
    "keywords": [
      "kolar gold fields",
      "gangster",
      "south cinema",
      "hindi dubbed",
      "mass action"
    ],
    "trailerKey": "JKa05nyUmuQ",
    "popularity": 92
  },
  {
    "id": "m_kalki",
    "tmdbId": 1022789,
    "title": "Kalki 2898 AD (Hindi Dubbed)",
    "overview": "In a dystopian world of Kasi in 2898 AD, the immortal warrior Ashwatthama awakens to protect the unborn savior Kalki from the totalitarian ruler Yaskin.",
    "genres": [
      "Science Fiction",
      "Action",
      "South (Hindi Dubbed)",
      "Fantasy"
    ],
    "releaseDate": "2024-06-27",
    "releaseYear": 2024,
    "posterPath": "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/p5ozvmdgsmbWe0H8Xk7Rc8SCwAB.jpg",
    "voteAverage": 7.6,
    "voteCount": 400,
    "runtime": 181,
    "director": "Nag Ashwin",
    "cast": [
      "Prabhas",
      "Amitabh Bachchan",
      "Deepika Padukone",
      "Kamal Haasan"
    ],
    "keywords": [
      "sci-fi",
      "mythology",
      "dystopia",
      "south indian",
      "hindi dubbed",
      "ashwatthama"
    ],
    "trailerKey": "y1-w1pP7Dzw",
    "popularity": 98
  },
  {
    "id": "m_pushpa",
    "tmdbId": 817451,
    "title": "Pushpa: The Rise (Hindi Dubbed)",
    "overview": "Pushpa Raj, a red sandalwood laborer in the forests of South India, rises fearlessly through the syndicate while facing a ruthless police superintendent.",
    "genres": [
      "Action",
      "Crime",
      "South (Hindi Dubbed)",
      "Thriller"
    ],
    "releaseDate": "2021-12-17",
    "releaseYear": 2021,
    "posterPath": "https://image.tmdb.org/t/p/w500/ccsSqbpEqr2KK9eMvoeF8ERFCd5.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/A0xW7GgeFQoQmPOn7HcHkBQ5nlb.jpg",
    "voteAverage": 7.3,
    "voteCount": 500,
    "runtime": 179,
    "director": "Sukumar",
    "cast": [
      "Allu Arjun",
      "Rashmika Mandanna",
      "Fahadh Faasil",
      "Jagapathi Babu"
    ],
    "keywords": [
      "red sandalwood",
      "allu arjun",
      "jhukega nahi",
      "south hindi dubbed",
      "mass action"
    ],
    "trailerKey": "pKctjlpbqpQ",
    "popularity": 90
  },
  {
    "id": "m_kantara",
    "tmdbId": 1033139,
    "title": "Kantara (Hindi Dubbed)",
    "overview": "When greed paves the way for betrayal and scheming, a young tribal champion reluctantly embraces his ancestors' mystical legacy to defend his sacred forest.",
    "genres": [
      "Action",
      "Thriller",
      "South (Hindi Dubbed)",
      "Drama"
    ],
    "releaseDate": "2022-09-30",
    "releaseYear": 2022,
    "posterPath": "https://image.tmdb.org/t/p/w500/lfgmWyWWV3WPJ53jxWUQa3NtJ8f.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/xKCpH9xF4JReTL5NsWm4wtafPQP.jpg",
    "voteAverage": 7.9,
    "voteCount": 450,
    "runtime": 148,
    "director": "Rishab Shetty",
    "cast": [
      "Rishab Shetty",
      "Sapthami Gowda",
      "Kishore Kumar G.",
      "Achyuth Kumar"
    ],
    "keywords": [
      "boota kola",
      "demigod",
      "tribal culture",
      "karnataka",
      "divine wrath",
      "hindi dubbed"
    ],
    "trailerKey": "6o7bKx9Y1z8",
    "popularity": 89
  },
  {
    "id": "m_baahubali2",
    "tmdbId": 353486,
    "title": "Baahubali 2: The Conclusion (Hindi Dubbed)",
    "overview": "When Shiva, the son of Bahubali, learns about his royal heritage, he begins an epic quest to avenge his father and free his mother from the tyrant Bhallaladeva.",
    "genres": [
      "Action",
      "Fantasy",
      "South (Hindi Dubbed)",
      "Drama"
    ],
    "releaseDate": "2017-04-28",
    "releaseYear": 2017,
    "posterPath": "https://image.tmdb.org/t/p/w500/pSgXKPU5h6U89ipF7HBYajvYt7j.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/zZKmEmRDc7ZjFucPm2UGNgDRlDc.jpg",
    "voteAverage": 7.5,
    "voteCount": 1200,
    "runtime": 167,
    "director": "S.S. Rajamouli",
    "cast": [
      "Prabhas",
      "Rana Daggubati",
      "Anushka Shetty",
      "Tamannaah Bhatia"
    ],
    "keywords": [
      "mahishmati",
      "katappa",
      "rajamouli",
      "epic war",
      "south indian",
      "hindi dubbed"
    ],
    "trailerKey": "qD-6d8Wo3do",
    "popularity": 88
  },
  {
    "id": "m_12th_fail",
    "tmdbId": 1183905,
    "title": "12th Fail",
    "overview": "Based on the true story of Manoj Kumar Sharma, who restarted his academic journey and conquered the UPSC exam, becoming an IPS officer against impossible odds.",
    "genres": [
      "Drama",
      "Bollywood",
      "Biography"
    ],
    "releaseDate": "2023-10-27",
    "releaseYear": 2023,
    "posterPath": "https://image.tmdb.org/t/p/w500/znbGgoqcQB0pxoTSO5imfALWOk3.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/d3DbYA943SwXhqgDSj7fh9Xn8Tp.jpg",
    "voteAverage": 8.3,
    "voteCount": 800,
    "runtime": 147,
    "director": "Vidhu Vinod Chopra",
    "cast": [
      "Vikrant Massey",
      "Medha Shankr",
      "Anant V Joshi",
      "Geeta Agrawal Sharma"
    ],
    "keywords": [
      "restart",
      "upsc",
      "inspirational",
      "true story",
      "bollywood",
      "hindi cinema"
    ],
    "trailerKey": "we3k2_p1qZg",
    "popularity": 91
  },
  {
    "id": "m_jawan",
    "tmdbId": 872906,
    "title": "Jawan",
    "overview": "A high-octane action thriller detailing the emotional journey of a vigilante who seeks to right the wrongs in society with a team of six lethal women fighters.",
    "genres": [
      "Action",
      "Thriller",
      "Bollywood"
    ],
    "releaseDate": "2023-09-07",
    "releaseYear": 2023,
    "posterPath": "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/5LtSjMNw6j3LkG29Oa4O0iY5U8.jpg",
    "voteAverage": 7.3,
    "voteCount": 600,
    "runtime": 169,
    "director": "Atlee",
    "cast": [
      "Shah Rukh Khan",
      "Nayanthara",
      "Vijay Sethupathi",
      "Deepika Padukone"
    ],
    "keywords": [
      "shah rukh khan",
      "srk",
      "action",
      "vigilante",
      "bollywood",
      "social justice"
    ],
    "trailerKey": "MWOlnZSnXWE",
    "popularity": 94
  },
  {
    "id": "m_3_idiots",
    "tmdbId": 20453,
    "title": "3 Idiots",
    "overview": "Two friends search for their long-lost companion Rancho while revisiting their engineering college days and remembering his free-thinking philosophy of life.",
    "genres": [
      "Comedy",
      "Drama",
      "Bollywood"
    ],
    "releaseDate": "2009-12-25",
    "releaseYear": 2009,
    "posterPath": "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/u7kuUaySqXBVAtqEl9vkTkAzHV9.jpg",
    "voteAverage": 8,
    "voteCount": 2400,
    "runtime": 170,
    "director": "Rajkumar Hirani",
    "cast": [
      "Aamir Khan",
      "R. Madhavan",
      "Sharman Joshi",
      "Kareena Kapoor Khan"
    ],
    "keywords": [
      "aal izz well",
      "college",
      "engineering",
      "passion",
      "friendship",
      "bollywood classic"
    ],
    "trailerKey": "K0eDlFX9GMc",
    "popularity": 89
  },
  {
    "id": "m_andhadhun",
    "tmdbId": 534780,
    "title": "Andhadhun",
    "overview": "A series of mysterious events unfold when a pianist pretending to be blind inadvertently becomes the sole witness to the murder of a former film star.",
    "genres": [
      "Crime",
      "Thriller",
      "Mystery",
      "Bollywood"
    ],
    "releaseDate": "2018-10-05",
    "releaseYear": 2018,
    "posterPath": "https://image.tmdb.org/t/p/w500/dy3K6hNvwE05siGgiLJcEiwgpdO.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/73aKTjdQ46jpv3InqNVnV76Nl0K.jpg",
    "voteAverage": 7.7,
    "voteCount": 650,
    "runtime": 139,
    "director": "Sriram Raghavan",
    "cast": [
      "Ayushmann Khurrana",
      "Tabu",
      "Radhika Apte",
      "Anil Dhawan"
    ],
    "keywords": [
      "piano",
      "fake blind",
      "murder witness",
      "black comedy",
      "bollywood thriller"
    ],
    "trailerKey": "2iVYI99VGaw",
    "popularity": 84
  },
  {
    "id": "m_tumbbad",
    "tmdbId": 538858,
    "title": "Tumbbad",
    "overview": "When a greedy young man discovers a cursed temple hiding the gold of Hastar, an ancient fallen god, unyielding greed consumes generations of his family.",
    "genres": [
      "Horror",
      "Fantasy",
      "Mystery",
      "Bollywood"
    ],
    "releaseDate": "2018-10-12",
    "releaseYear": 2018,
    "posterPath": "https://image.tmdb.org/t/p/w500/z1xOCxw780WFJC5uCTMfCkQ4Agi.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/l0YKBu3LaehIFzBNjseLjx7MbaN.jpg",
    "voteAverage": 8,
    "voteCount": 400,
    "runtime": 104,
    "director": "Rahi Anil Barve",
    "cast": [
      "Sohum Shah",
      "Jyoti Malshe",
      "Anita Date-Kelkar",
      "Ronjini Chakraborty"
    ],
    "keywords": [
      "hastar",
      "gold coins",
      "rainy fortress",
      "greed",
      "indian folk horror",
      "atmospheric"
    ],
    "trailerKey": "sN75MPxgvX8",
    "popularity": 86
  },
  {
    "id": "m_drishyam",
    "tmdbId": 346685,
    "title": "Drishyam",
    "overview": "A simple cable operator fabricates an airtight alibi on October 2nd to shield his wife and daughters when an unexpected accident brings police suspicion.",
    "genres": [
      "Crime",
      "Drama",
      "Mystery",
      "Bollywood"
    ],
    "releaseDate": "2015-07-31",
    "releaseYear": 2015,
    "posterPath": "https://image.tmdb.org/t/p/w500/AhTO2QWG0tug7yDoh0XoaMhPt3J.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/4SO6pbGJTpM9YYovYxFLY3MXqZn.jpg",
    "voteAverage": 7.7,
    "voteCount": 550,
    "runtime": 163,
    "director": "Nishikant Kamat",
    "cast": [
      "Ajay Devgn",
      "Tabu",
      "Shriya Saran",
      "Rajat Kapoor"
    ],
    "keywords": [
      "alibi",
      "october 2nd",
      "police interrogation",
      "clever coverup",
      "bollywood thriller"
    ],
    "trailerKey": "AuuX2j14NBg",
    "popularity": 87
  },
  {
    "id": "m_stree2",
    "tmdbId": 1142518,
    "title": "Stree 2",
    "overview": "The town of Chanderi is terrorized by a terrifying headless ghost named Sarkata, forcing Vicky and his quirky squad to enlist the guardian spirit Stree.",
    "genres": [
      "Horror",
      "Comedy",
      "Bollywood"
    ],
    "releaseDate": "2024-08-15",
    "releaseYear": 2024,
    "posterPath": "https://image.tmdb.org/t/p/w500/b2YL2kncIqlcDcqly78AsOPJi6r.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/n9Do4rv1Hl3QvQLMmT5w6pBadqq.jpg",
    "voteAverage": 7.3,
    "voteCount": 300,
    "runtime": 147,
    "director": "Amar Kaushik",
    "cast": [
      "Rajkummar Rao",
      "Shraddha Kapoor",
      "Pankaj Tripathi",
      "Abhishek Banerjee"
    ],
    "keywords": [
      "sarkata",
      "chanderi",
      "horror comedy",
      "stree",
      "blockbuster",
      "bollywood"
    ],
    "trailerKey": "KVnug9nnn00",
    "popularity": 93
  },
  {
    "id": "m_vikram",
    "tmdbId": 725201,
    "title": "Vikram (Hindi Dubbed)",
    "overview": "A special commander leads a covert black-ops task force to eradicate a masked drug cartel syndicate terrorizing the city in this gritty south action blockbuster.",
    "genres": [
      "Action",
      "Crime",
      "Thriller",
      "South (Hindi Dubbed)"
    ],
    "releaseDate": "2022-06-03",
    "releaseYear": 2022,
    "posterPath": "https://image.tmdb.org/t/p/w500/8cXbitsS6dWQ5gfMTZdorpAAzEH.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/2u1YBNBlSwvBReyvI7i5z5ykQXP.jpg",
    "voteAverage": 7.8,
    "voteCount": 500,
    "runtime": 174,
    "director": "Lokesh Kanagaraj",
    "cast": [
      "Kamal Haasan",
      "Vijay Sethupathi",
      "Fahadh Faasil",
      "Suriya"
    ],
    "keywords": [
      "lcu",
      "rolex",
      "drug cartel",
      "masked vigilante",
      "south cinema",
      "hindi dubbed"
    ],
    "trailerKey": "OKBMCLHSZo8",
    "popularity": 89
  }
];

// Pre-seeded interactions for the 3 default users
const INITIAL_INTERACTIONS: Interaction[] = [
  // Maya Lin (Sci-Fi lover)
  { id: 'int_m_1', userId: 'user_maya', movieId: 'm_br2049', type: 'superlike', rating: 10, timestamp: '2026-10-20T10:00:00Z' },
  { id: 'int_m_2', userId: 'user_maya', movieId: 'm_dune2', type: 'like', rating: 9, timestamp: '2026-10-21T11:00:00Z' },
  { id: 'int_m_3', userId: 'user_maya', movieId: 'm_interstellar', type: 'superlike', rating: 10, timestamp: '2026-10-22T12:00:00Z' },
  { id: 'int_m_4', userId: 'user_maya', movieId: 'm_kalki', type: 'superlike', rating: 10, timestamp: '2026-10-23T13:00:00Z' },
  { id: 'int_m_5', userId: 'user_maya', movieId: 'm_tumbbad', type: 'like', rating: 9, timestamp: '2026-10-24T14:00:00Z' },
  { id: 'int_m_6', userId: 'user_maya', movieId: 'm_amelie', type: 'dislike', rating: 4, timestamp: '2026-10-26T17:00:00Z' },

  // Marcus Vance (Thriller / Noir lover)
  { id: 'int_mv_1', userId: 'user_marcus', movieId: 'm_se7en', type: 'superlike', rating: 10, timestamp: '2026-10-20T10:00:00Z' },
  { id: 'int_mv_2', userId: 'user_marcus', movieId: 'm_zodiac', type: 'superlike', rating: 10, timestamp: '2026-10-21T11:00:00Z' },
  { id: 'int_mv_3', userId: 'user_marcus', movieId: 'm_andhadhun', type: 'superlike', rating: 10, timestamp: '2026-10-22T12:00:00Z' },
  { id: 'int_mv_4', userId: 'user_marcus', movieId: 'm_drishyam', type: 'like', rating: 9, timestamp: '2026-10-23T14:00:00Z' },
  { id: 'int_mv_5', userId: 'user_marcus', movieId: 'm_kgf2', type: 'like', rating: 9, timestamp: '2026-10-24T15:00:00Z' },
  { id: 'int_mv_6', userId: 'user_marcus', movieId: 'm_spirited_away', type: 'dislike', rating: 3, timestamp: '2026-10-26T17:00:00Z' },

  // Elena Rostova (Indie Romance / Poetic Cinema lover)
  { id: 'int_er_1', userId: 'user_elena', movieId: 'm_12th_fail', type: 'superlike', rating: 10, timestamp: '2026-10-20T10:00:00Z' },
  { id: 'int_er_2', userId: 'user_elena', movieId: 'm_3_idiots', type: 'superlike', rating: 10, timestamp: '2026-10-21T11:00:00Z' },
  { id: 'int_er_3', userId: 'user_elena', movieId: 'm_rrr', type: 'like', rating: 9, timestamp: '2026-10-22T12:00:00Z' },
  { id: 'int_er_4', userId: 'user_elena', movieId: 'm_past_lives', type: 'like', rating: 9, timestamp: '2026-10-23T14:00:00Z' },
  { id: 'int_er_5', userId: 'user_elena', movieId: 'm_before_sunrise', type: 'like', rating: 9, timestamp: '2026-10-24T15:00:00Z' },
  { id: 'int_er_6', userId: 'user_elena', movieId: 'm_se7en', type: 'dislike', rating: 4, timestamp: '2026-10-26T17:00:00Z' },
];

// Pre-seeded watchlists
const INITIAL_WATCHLISTS: WatchlistItem[] = [
  { id: 'wl_m_1', userId: 'user_maya', movieId: 'm_solaris', watched: false, addedAt: '2026-10-22T08:00:00Z', notes: 'Classic existential sci-fi by Tarkovsky' },
  { id: 'wl_mv_1', userId: 'user_marcus', movieId: 'm_chinatown', watched: false, addedAt: '2026-10-22T08:00:00Z', notes: 'Essential neo-noir cornerstone' },
  { id: 'wl_er_1', userId: 'user_elena', movieId: 'm_drive_my_car', watched: false, addedAt: '2026-10-22T08:00:00Z', notes: 'Hamaguchi lyrical masterpiece' },
];

const DEFAULT_WEIGHTS: RecommenderWeights = {
  contentWeight: 0.40,
  collabWeight: 0.35,
  semanticWeight: 0.25,
};

class CinemaDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const loadedMovies = parsed.movies || [];
        const existingIds = new Set(loadedMovies.map((m: any) => m.id));
        INITIAL_MOVIES.forEach(m => {
          if (!existingIds.has(m.id)) {
            loadedMovies.push(m);
          }
        });

        const schema: DatabaseSchema = {
          users: parsed.users || DEFAULT_USERS,
          movies: loadedMovies,
          interactions: parsed.interactions || INITIAL_INTERACTIONS,
          watchlists: parsed.watchlists || INITIAL_WATCHLISTS,
          userWeights: parsed.userWeights || {},
        };
        this.persist(schema);
        return schema;
      }
    } catch (err) {
      console.warn('Failed to read database file, initializing defaults:', err);
    }

    const initial: DatabaseSchema = {
      users: DEFAULT_USERS,
      movies: INITIAL_MOVIES,
      interactions: INITIAL_INTERACTIONS,
      watchlists: INITIAL_WATCHLISTS,
      userWeights: {
        user_maya: { ...DEFAULT_WEIGHTS },
        user_marcus: { ...DEFAULT_WEIGHTS },
        user_elena: { ...DEFAULT_WEIGHTS },
      },
    };
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // --- Users Collection ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUser(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public addUser(user: User): User {
    const existingIndex = this.data.users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = user;
    } else {
      this.data.users.push(user);
    }
    this.persist();
    return user;
  }

  // --- Movies Collection ---
  public getMovies(): Movie[] {
    return this.data.movies;
  }

  public getMovie(id: string): Movie | undefined {
    return this.data.movies.find(m => m.id === id || String(m.tmdbId) === String(id));
  }

  public upsertMovie(movie: Movie): Movie {
    const existingIndex = this.data.movies.findIndex(
      m => m.id === movie.id || (movie.tmdbId && m.tmdbId === movie.tmdbId)
    );
    if (existingIndex >= 0) {
      this.data.movies[existingIndex] = { ...this.data.movies[existingIndex], ...movie };
    } else {
      this.data.movies.push(movie);
    }
    this.persist();
    return movie;
  }

  // --- Interactions Collection (Likes, Dislikes, Ratings) ---
  public getInteractions(userId?: string): Interaction[] {
    if (userId) {
      return this.data.interactions.filter(i => i.userId === userId);
    }
    return this.data.interactions;
  }

  public getMovieInteraction(userId: string, movieId: string): Interaction | undefined {
    return this.data.interactions.find(i => i.userId === userId && i.movieId === movieId);
  }

  public saveInteraction(interaction: Omit<Interaction, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Interaction {
    const existingIndex = this.data.interactions.findIndex(
      i => i.userId === interaction.userId && i.movieId === interaction.movieId
    );

    const fullInteraction: Interaction = {
      id: interaction.id || `int_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: interaction.userId,
      movieId: interaction.movieId,
      type: interaction.type,
      rating: interaction.rating,
      timestamp: interaction.timestamp || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.interactions[existingIndex] = fullInteraction;
    } else {
      this.data.interactions.push(fullInteraction);
    }
    this.persist();
    return fullInteraction;
  }

  public removeInteraction(userId: string, movieId: string): boolean {
    const initialLen = this.data.interactions.length;
    this.data.interactions = this.data.interactions.filter(
      i => !(i.userId === userId && i.movieId === movieId)
    );
    if (this.data.interactions.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Watchlist Collection ---
  public getWatchlist(userId: string): (WatchlistItem & { movie?: Movie })[] {
    const list = this.data.watchlists.filter(w => w.userId === userId);
    return list.map(item => ({
      ...item,
      movie: this.getMovie(item.movieId),
    }));
  }

  public isInWatchlist(userId: string, movieId: string): boolean {
    return this.data.watchlists.some(w => w.userId === userId && w.movieId === movieId);
  }

  public toggleWatchlist(userId: string, movieId: string, notes?: string): { inWatchlist: boolean; item?: WatchlistItem } {
    const existingIndex = this.data.watchlists.findIndex(w => w.userId === userId && w.movieId === movieId);
    if (existingIndex >= 0) {
      this.data.watchlists.splice(existingIndex, 1);
      this.persist();
      return { inWatchlist: false };
    } else {
      const newItem: WatchlistItem = {
        id: `wl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId,
        movieId,
        watched: false,
        notes: notes || '',
        addedAt: new Date().toISOString(),
      };
      this.data.watchlists.push(newItem);
      this.persist();
      return { inWatchlist: true, item: newItem };
    }
  }

  public setWatchedStatus(userId: string, movieId: string, watched: boolean): boolean {
    const item = this.data.watchlists.find(w => w.userId === userId && w.movieId === movieId);
    if (item) {
      item.watched = watched;
      this.persist();
      return true;
    }
    return false;
  }

  // --- Recommender Weights Collection ---
  public getWeights(userId: string): RecommenderWeights {
    return this.data.userWeights[userId] || { ...DEFAULT_WEIGHTS };
  }

  public updateWeights(userId: string, weights: Partial<RecommenderWeights>): RecommenderWeights {
    const current = this.getWeights(userId);
    const updated: RecommenderWeights = {
      contentWeight: weights.contentWeight ?? current.contentWeight,
      collabWeight: weights.collabWeight ?? current.collabWeight,
      semanticWeight: weights.semanticWeight ?? current.semanticWeight,
    };
    this.data.userWeights[userId] = updated;
    this.persist();
    return updated;
  }

  public resetToDefaults(): void {
    this.data = {
      users: DEFAULT_USERS,
      movies: INITIAL_MOVIES,
      interactions: INITIAL_INTERACTIONS,
      watchlists: INITIAL_WATCHLISTS,
      userWeights: {
        user_maya: { ...DEFAULT_WEIGHTS },
        user_marcus: { ...DEFAULT_WEIGHTS },
        user_elena: { ...DEFAULT_WEIGHTS },
      },
    };
    this.persist();
  }
}

export const db = new CinemaDatabase();
