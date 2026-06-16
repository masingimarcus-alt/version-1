// Mock data for E-Competition platform

export const currentUser = {
  id: 'u1',
  username: 'ShadowStriker',
  tag: '#4829',
  avatar: '/images/avatar-placeholder.png',
  country: 'Algeria',
  city: 'Algiers',
  level: 42,
  xp: 7840,
  xpNext: 10000,
  rank: 'Diamond',
  rankIcon: 'diamond',
  joinDate: '2023-01-15',
  bio: 'Competitive FIFA player. Top 100 ranked. Looking for pro team.',
  stats: {
    matchesPlayed: 247,
    wins: 189,
    losses: 58,
    winRate: 76.5,
    tournamentsPlayed: 31,
    trophiesWon: 12,
    goals: 834,
    assists: 421,
    cleanSheets: 54,
  },
  role: 'admin', // 'player' | 'admin'
}

export const tournaments = [
  {
    id: 't1',
    name: 'FIFA 25 Champions Cup',
    game: 'EA FC 25',
    cover: '/images/tournament-fifa.png',
    prize: '$5,000',
    prizeRaw: 5000,
    registeredPlayers: 48,
    maxPlayers: 64,
    status: 'live',
    startDate: '2025-06-15',
    endDate: '2025-06-22',
    platform: 'PS5',
    format: 'Single Elimination',
    entryFee: 'Free',
    organizer: 'E-Competition',
    description: 'The premier FIFA 25 tournament in Algeria. Compete against the best players and win a share of the $5,000 prize pool.',
    rules: [
      '4-minute halves',
      'No custom tactics exploits',
      'All player squads allowed',
      'Match results must be screenshotted',
      'No rage quitting - automatic loss',
    ],
    schedule: [
      { round: 'Group Stage', date: '2025-06-15', time: '18:00' },
      { round: 'Round of 16', date: '2025-06-17', time: '19:00' },
      { round: 'Quarterfinals', date: '2025-06-19', time: '19:00' },
      { round: 'Semifinals', date: '2025-06-21', time: '20:00' },
      { round: 'Grand Final', date: '2025-06-22', time: '21:00' },
    ],
  },
  {
    id: 't2',
    name: 'Rocket League Invitational',
    game: 'Rocket League',
    cover: '/images/tournament-rocket.png',
    prize: '$2,500',
    prizeRaw: 2500,
    registeredPlayers: 30,
    maxPlayers: 32,
    status: 'upcoming',
    startDate: '2025-07-01',
    endDate: '2025-07-03',
    platform: 'PS5 / Xbox',
    format: 'Double Elimination',
    entryFee: '$5',
    organizer: 'E-Competition',
    description: 'Fast-paced Rocket League 2v2 tournament. Form your team and compete for glory.',
    rules: [
      'Teams of 2',
      'Default mutators',
      'No smurfing allowed',
      'Substitutes allowed between rounds',
    ],
    schedule: [
      { round: 'Opening Round', date: '2025-07-01', time: '17:00' },
      { round: 'Winners Bracket', date: '2025-07-02', time: '18:00' },
      { round: 'Grand Final', date: '2025-07-03', time: '20:00' },
    ],
  },
  {
    id: 't3',
    name: 'eFootball Pro League S2',
    game: 'eFootball 2025',
    cover: '/images/hero-tournament.png',
    prize: '$1,000',
    prizeRaw: 1000,
    registeredPlayers: 16,
    maxPlayers: 16,
    status: 'full',
    startDate: '2025-06-28',
    endDate: '2025-06-29',
    platform: 'PS5',
    format: 'Round Robin + Finals',
    entryFee: '$10',
    organizer: 'E-Competition',
    description: 'Season 2 of the eFootball Pro League. Prove yourself against the elite.',
    rules: [
      '5-minute halves',
      'Rated matches only',
      'Top 4 from groups advance',
    ],
    schedule: [
      { round: 'Group Stage', date: '2025-06-28', time: '16:00' },
      { round: 'Finals Day', date: '2025-06-29', time: '19:00' },
    ],
  },
]

export const leaderboard = [
  { rank: 1, userId: 'u2', username: 'NightHawk_DZ', avatar: '/images/avatar-placeholder.png', country: 'DZ', wins: 312, points: 9840, level: 67, trend: 'up' },
  { rank: 2, userId: 'u3', username: 'ProGoalkeeper', avatar: '/images/avatar-placeholder.png', country: 'DZ', wins: 287, points: 8920, level: 61, trend: 'same' },
  { rank: 3, userId: 'u4', username: 'ViperFC', avatar: '/images/avatar-placeholder.png', country: 'MA', wins: 265, points: 8201, level: 58, trend: 'up' },
  { rank: 4, userId: 'u1', username: 'ShadowStriker', avatar: '/images/avatar-placeholder.png', country: 'DZ', wins: 189, points: 7840, level: 42, trend: 'up' },
  { rank: 5, userId: 'u5', username: 'AlgerianLion', avatar: '/images/avatar-placeholder.png', country: 'DZ', wins: 178, points: 7100, level: 39, trend: 'down' },
  { rank: 6, userId: 'u6', username: 'King_Salim', avatar: '/images/avatar-placeholder.png', country: 'DZ', wins: 165, points: 6880, level: 37, trend: 'up' },
  { rank: 7, userId: 'u7', username: 'DesertFox_7', avatar: '/images/avatar-placeholder.png', country: 'TN', wins: 154, points: 6200, level: 35, trend: 'down' },
  { rank: 8, userId: 'u8', username: 'Maestro99', avatar: '/images/avatar-placeholder.png', country: 'DZ', wins: 141, points: 5950, level: 33, trend: 'same' },
  { rank: 9, userId: 'u9', username: 'ZizouJunior', avatar: '/images/avatar-placeholder.png', country: 'DZ', wins: 128, points: 5400, level: 30, trend: 'up' },
  { rank: 10, userId: 'u10', username: 'GhostPlayer_X', avatar: '/images/avatar-placeholder.png', country: 'MA', wins: 119, points: 4900, level: 28, trend: 'down' },
]

export const activityFeed = [
  { id: 'a1', type: 'win', message: 'Won a FIFA 25 match against ProGoalkeeper', time: '2 min ago', xp: 120 },
  { id: 'a2', type: 'tournament', message: 'Joined FIFA 25 Champions Cup tournament', time: '1 hour ago', xp: 50 },
  { id: 'a3', type: 'level', message: 'Reached Level 42 — Diamond tier unlocked', time: '3 hours ago', xp: 500 },
  { id: 'a4', type: 'xp', message: 'Earned 350 XP from weekend challenge', time: '5 hours ago', xp: 350 },
  { id: 'a5', type: 'trophy', message: 'Won the eFootball Pro League S1 trophy', time: '2 days ago', xp: 1000 },
  { id: 'a6', type: 'win', message: 'Win streak x5 — Unstoppable badge earned', time: '3 days ago', xp: 200 },
]

export const upcomingMatches = [
  {
    id: 'm1',
    opponent: { username: 'NightHawk_DZ', avatar: '/images/avatar-placeholder.png', level: 67 },
    tournament: 'FIFA 25 Champions Cup',
    date: '2025-06-17',
    time: '19:00',
    round: 'Round of 16',
    platform: 'PS5',
  },
  {
    id: 'm2',
    opponent: { username: 'ViperFC', avatar: '/images/avatar-placeholder.png', level: 58 },
    tournament: 'eFootball Pro League S2',
    date: '2025-06-28',
    time: '16:00',
    round: 'Group Stage',
    platform: 'PS5',
  },
]

export const matchHistory = [
  { id: 'mh1', opponent: 'ProGoalkeeper', result: 'win', score: '3-1', date: '2025-06-10', tournament: 'FIFA 25 Champions Cup', xp: 120 },
  { id: 'mh2', opponent: 'DesertFox_7', result: 'win', score: '2-0', date: '2025-06-08', tournament: 'FIFA 25 Champions Cup', xp: 120 },
  { id: 'mh3', opponent: 'NightHawk_DZ', result: 'loss', score: '1-4', date: '2025-06-05', tournament: 'Friendly', xp: 30 },
  { id: 'mh4', opponent: 'AlgerianLion', result: 'win', score: '2-1', date: '2025-06-02', tournament: 'eFootball Pro League S1', xp: 120 },
  { id: 'mh5', opponent: 'King_Salim', result: 'win', score: '4-2', date: '2025-05-29', tournament: 'eFootball Pro League S1', xp: 120 },
]

export const achievements = [
  { id: 'ach1', name: 'First Blood', description: 'Win your first match', icon: 'sword', unlocked: true, date: '2023-01-20' },
  { id: 'ach2', name: 'Tournament Winner', description: 'Win a tournament', icon: 'trophy', unlocked: true, date: '2023-03-15' },
  { id: 'ach3', name: 'Unstoppable', description: 'Achieve a 10-win streak', icon: 'flame', unlocked: true, date: '2024-02-10' },
  { id: 'ach4', name: 'Diamond Player', description: 'Reach Diamond rank', icon: 'diamond', unlocked: true, date: '2024-08-22' },
  { id: 'ach5', name: 'Legend', description: 'Win 5 tournaments', icon: 'star', unlocked: false, date: null },
  { id: 'ach6', name: 'Centurion', description: 'Play 100 matches', icon: 'shield', unlocked: true, date: '2023-11-04' },
]

export const marketplaceItems = [
  {
    id: 'p1',
    name: 'PlayStation 5 Disc Edition',
    category: 'Consoles',
    price: 45000,
    currency: 'TL',
    condition: 'Like New',
    seller: { username: 'NightHawk_DZ', avatar: '/images/avatar-placeholder.png', rating: 4.9, sales: 23 },
    image: '/images/ps5-console.png',
    description: 'PS5 Disc Edition, purchased 6 months ago. Comes with original box, 2 controllers, and 3 games.',
    favorited: false,
    verified: true,
  },
  {
    id: 'p2',
    name: 'Xbox Series X',
    category: 'Consoles',
    price: 55000,
    currency: 'TL',
    condition: 'Excellent',
    seller: { username: 'ViperFC', avatar: '/images/avatar-placeholder.png', rating: 4.7, sales: 11 },
    image: '/images/xbox-series-x.png',
    description: 'Xbox Series X with Game Pass Ultimate subscription (3 months remaining).',
    favorited: true,
    verified: true,
  },
  {
    id: 'p3',
    name: 'DualSense Controller - Midnight Black',
    category: 'Controllers',
    price: 8500,
    currency: 'TL',
    condition: 'Good',
    seller: { username: 'AlgerianLion', avatar: '/images/avatar-placeholder.png', rating: 4.5, sales: 7 },
    image: '/images/controller-product.png',
    description: 'Official DualSense controller. Minor scuffs on triggers. Fully functional.',
    favorited: false,
    verified: false,
  },
  {
    id: 'p4',
    name: 'EA FC 25 PS5',
    category: 'Games',
    price: 4200,
    currency: 'TL',
    condition: 'New',
    seller: { username: 'Maestro99', avatar: '/images/avatar-placeholder.png', rating: 5.0, sales: 34 },
    image: '/images/tournament-fifa.png',
    description: 'Brand new sealed EA FC 25 for PS5.',
    favorited: false,
    verified: true,
  },
]

export const rentalConsoles = [
  {
    id: 'r1',
    name: 'PlayStation 5',
    model: 'Disc Edition',
    image: '/images/ps5-console.png',
    available: true,
    pricePerHour: 300,
    pricePerDay: 2000,
    deposit: 5000,
    currency: 'TL',
    features: ['4K Gaming', '120fps Support', 'DualSense Controller', 'HDMI Cable Included'],
    condition: 'Excellent',
  },
  {
    id: 'r2',
    name: 'PlayStation 5 Pro',
    model: 'Digital Edition',
    image: '/images/ps5-pro-console.png',
    available: false,
    pricePerHour: 400,
    pricePerDay: 2800,
    deposit: 6000,
    currency: 'TL',
    features: ['8K Ready', '120fps Ultra', 'DualSense Edge', 'Exclusive Pro Features'],
    condition: 'Like New',
  },
  {
    id: 'r3',
    name: 'Xbox Series X',
    model: 'Standard Edition',
    image: '/images/xbox-series-x.png',
    available: true,
    pricePerHour: 280,
    pricePerDay: 1800,
    deposit: 4500,
    currency: 'TL',
    features: ['4K Gaming', 'Quick Resume', 'Xbox Wireless Controller', 'Game Pass Compatible'],
    condition: 'Good',
  },
]

export const repairCategories = [
  { id: 'rc1', name: 'PlayStation 5', icon: 'gamepad-2', services: ['HDMI Port Repair', 'Disc Reader Fix', 'Overheating Fix', 'Controller Sync Issue', 'Software Reset'] },
  { id: 'rc2', name: 'Xbox Series X', icon: 'gamepad', services: ['HDMI Port Repair', 'Disc Reader Fix', 'Power Issue', 'Controller Pairing', 'Storage Upgrade'] },
  { id: 'rc3', name: 'Controllers', icon: 'cpu', services: ['Stick Drift Fix', 'Button Repair', 'Trigger Repair', 'Charging Port Fix', 'Full Refurbishment'] },
  { id: 'rc4', name: 'Gaming Headsets', icon: 'headphones', services: ['Microphone Repair', 'Speaker Repair', 'Cable Replacement', 'Cushion Replacement'] },
]

export const repairRequests = [
  { id: 'rr1', device: 'PlayStation 5', issue: 'HDMI Port Repair', status: 'in-progress', submitted: '2025-06-08', estimated: '2025-06-12', technician: 'Karim B.' },
  { id: 'rr2', device: 'DualSense Controller', issue: 'Stick Drift Fix', status: 'completed', submitted: '2025-05-28', estimated: '2025-05-30', technician: 'Youcef A.' },
]

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type OrderType = 'buy' | 'rent' | 'repair'

export interface Order {
  id: string
  type: OrderType
  status: OrderStatus
  date: string
  productName: string
  productImage: string
  price: number
  currency: string
  seller: { name: string; phone: string; verified: boolean }
  address: { street: string; city: string; wilaya: string; zip: string }
  mapLat: number
  mapLng: number
}

export const orders: Order[] = [
  {
    id: 'ord-001',
    type: 'buy',
    status: 'delivered',
    date: '2025-06-10',
    productName: 'PlayStation 5 Disc Edition',
    productImage: '/images/ps5-console.png',
    price: 45000,
    currency: 'TL',
    seller: { name: 'NightHawk_DZ', phone: '+213 555 123 456', verified: true },
    address: { street: '12 Rue Didouche Mourad', city: 'Algiers', wilaya: 'Alger', zip: '16000' },
    mapLat: 36.7538,
    mapLng: 3.0588,
  },
  {
    id: 'ord-002',
    type: 'rent',
    status: 'processing',
    date: '2025-06-13',
    productName: 'Xbox Series X — 2-Day Rental',
    productImage: '/images/xbox-series-x.png',
    price: 3600,
    currency: 'TL',
    seller: { name: 'E-Competition Store', phone: '+213 555 987 654', verified: true },
    address: { street: '45 Boulevard Khemisti', city: 'Algiers', wilaya: 'Alger', zip: '16001' },
    mapLat: 36.7625,
    mapLng: 3.0511,
  },
  {
    id: 'ord-003',
    type: 'repair',
    status: 'pending',
    date: '2025-06-14',
    productName: 'PS5 — HDMI Port Repair',
    productImage: '/images/ps5-console.png',
    price: 2500,
    currency: 'TL',
    seller: { name: 'E-Competition Repair', phone: '+213 555 111 222', verified: true },
    address: { street: '8 Rue Larbi Ben Mhidi', city: 'Algiers', wilaya: 'Alger', zip: '16000' },
    mapLat: 36.7517,
    mapLng: 3.0564,
  },
]
