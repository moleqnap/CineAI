import { Movie, TVShow, Genre, Person } from '../types';

export const genres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

export const trendingMovies: Movie[] = [
  {
    id: 1,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    poster_path: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    release_date: "2024-03-01",
    vote_average: 8.4,
    genre_ids: [12, 18, 878],
    genres: [
      { id: 12, name: 'Adventure' },
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' }
    ]
  },
  {
    id: 2,
    title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop",
    release_date: "2023-07-21",
    vote_average: 8.1,
    genre_ids: [18, 36],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 36, name: 'History' }
    ]
  },
  {
    id: 3,
    title: "Spider-Man: Across the Spider-Verse",
    overview: "After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse.",
    poster_path: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop",
    release_date: "2023-06-02",
    vote_average: 8.6,
    genre_ids: [16, 28, 12],
    genres: [
      { id: 16, name: 'Animation' },
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' }
    ]
  },
  {
    id: 4,
    title: "The Batman",
    overview: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family.",
    poster_path: "https://images.unsplash.com/photo-1635863138275-d9864d29b26b?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&h=1080&fit=crop",
    release_date: "2022-03-04",
    vote_average: 7.8,
    genre_ids: [28, 80, 18],
    genres: [
      { id: 28, name: 'Action' },
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' }
    ]
  },
  {
    id: 5,
    title: "Top Gun: Maverick",
    overview: "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot.",
    poster_path: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop",
    release_date: "2022-05-27",
    vote_average: 8.3,
    genre_ids: [28, 18],
    genres: [
      { id: 28, name: 'Action' },
      { id: 18, name: 'Drama' }
    ]
  },
  {
    id: 6,
    title: "Everything Everywhere All at Once",
    overview: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led.",
    poster_path: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop",
    release_date: "2022-03-25",
    vote_average: 7.8,
    genre_ids: [28, 12, 35],
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 35, name: 'Comedy' }
    ]
  },
  {
    id: 7,
    title: "Avatar: The Way of Water",
    overview: "Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, and the lengths they go to keep each other safe.",
    poster_path: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop",
    release_date: "2022-12-16",
    vote_average: 7.6,
    genre_ids: [878, 12, 28],
    genres: [
      { id: 878, name: 'Science Fiction' },
      { id: 12, name: 'Adventure' },
      { id: 28, name: 'Action' }
    ]
  },
  {
    id: 8,
    title: "John Wick: Chapter 4",
    overview: "With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table.",
    poster_path: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&h=1080&fit=crop",
    release_date: "2023-03-24",
    vote_average: 7.8,
    genre_ids: [28, 53, 80],
    genres: [
      { id: 28, name: 'Action' },
      { id: 53, name: 'Thriller' },
      { id: 80, name: 'Crime' }
    ]
  }
];

export const trendingTVShows: TVShow[] = [
  {
    id: 101,
    name: "House of the Dragon",
    overview: "The Targaryen dynasty is at the absolute apex of its power, with more than 10 dragons under their yoke.",
    poster_path: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
    first_air_date: "2022-08-21",
    vote_average: 8.4,
    genre_ids: [18, 14, 10759],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 14, name: 'Fantasy' }
    ]
  },
  {
    id: 102,
    name: "Wednesday",
    overview: "Follow Wednesday Addams' years as a student at Nevermore Academy, where she attempts to master her emerging psychic ability.",
    poster_path: "https://images.unsplash.com/photo-1635863138275-d9864d29b26b?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=1080&fit=crop",
    first_air_date: "2022-11-23",
    vote_average: 8.1,
    genre_ids: [35, 80, 9648],
    genres: [
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 9648, name: 'Mystery' }
    ]
  },
  {
    id: 103,
    name: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.",
    poster_path: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop",
    first_air_date: "2016-07-15",
    vote_average: 8.7,
    genre_ids: [18, 14, 27],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 14, name: 'Fantasy' },
      { id: 27, name: 'Horror' }
    ]
  },
  {
    id: 104,
    name: "The Last of Us",
    overview: "Twenty years after modern civilization has been destroyed, Joel must smuggle Ellie out of an oppressive quarantine zone.",
    poster_path: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&h=750&fit=crop",
    backdrop_path: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop",
    first_air_date: "2023-01-15",
    vote_average: 8.8,
    genre_ids: [18, 10759, 878],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' }
    ]
  }
];

export const popularActors: Person[] = [
  {
    id: 1,
    name: "Timothée Chalamet",
    profile_path: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    known_for_department: "Acting"
  },
  {
    id: 2,
    name: "Zendaya",
    profile_path: "https://images.unsplash.com/photo-1494790108755-2616c2f7da41?w=300&h=300&fit=crop&crop=face",
    known_for_department: "Acting"
  },
  {
    id: 3,
    name: "Tom Holland",
    profile_path: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    known_for_department: "Acting"
  },
  {
    id: 4,
    name: "Margot Robbie",
    profile_path: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face",
    known_for_department: "Acting"
  }
];

export const moods = [
  { id: 'happy', name: 'Happy', emoji: '😄', color: 'from-yellow-400 to-orange-500' },
  { id: 'sad', name: 'Sad', emoji: '😢', color: 'from-blue-400 to-indigo-600' },
  { id: 'excited', name: 'Excited', emoji: '🤩', color: 'from-pink-400 to-red-500' },
  { id: 'relaxed', name: 'Relaxed', emoji: '😌', color: 'from-green-400 to-teal-500' },
  { id: 'adventurous', name: 'Adventurous', emoji: '🏔️', color: 'from-purple-400 to-indigo-600' },
  { id: 'romantic', name: 'Romantic', emoji: '💕', color: 'from-pink-400 to-rose-500' },
  { id: 'thoughtful', name: 'Thoughtful', emoji: '🤔', color: 'from-gray-400 to-slate-600' }
];