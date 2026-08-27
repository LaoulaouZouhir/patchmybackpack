export interface Bid {
  id: string;
  brand: string;
  url: string;
  logo: string;
  logoIncludesName?: boolean;
  amount: number;
  timestamp: number;
}

export interface SpotCoords {
  top: string;
  left: string;
  width: string;
  height: string;
  rotateX?: string;
  rotateY?: string;
  rotateZ?: string;
  skewX?: string;
  skewY?: string;
}

export interface Spot {
  id: number;
  label: string;
  shortLabel: string;
  zone: string;
  size: 'S' | 'M' | 'L' | 'XL';
  dimensions: string;
  startingBid: number;
  currentBid: number;
  bidCount: number;
  topBidder: {
    brand: string;
    url: string;
    logo: string;
  };
  coords2d: SpotCoords;
  coords3d: SpotCoords;
  coords?: SpotCoords;
  description: string;
  visibilityNote: string;
  bidsHistory: Bid[];
}

export interface CampaignGoal {
  targetAmount: number;
  totalRaised: number;
  currency: 'EUR' | 'USD';
  currencyRate: number; // EUR to USD rate
  endDate: string; // ISO string
  activeVisitors: number;
  totalViews: number;
}

export interface ProofPhoto {
  id: string;
  city: string;
  country: string;
  flag: string;
  location: string;
  caption: string;
  image: string;
  dateTag: string;
}

export const initialCampaignGoal: CampaignGoal = {
  targetAmount: 1850,
  totalRaised: 2160,
  currency: 'EUR',
  currencyRate: 1.08,
  endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
  activeVisitors: 74,
  totalViews: 18420,
};

export const initialSpots: Spot[] = [
  {
    id: 1,
    label: "Top Flap: Upper Left",
    shortLabel: "Flap Top-Left",
    zone: "Top Flap",
    size: "L",
    dimensions: "9 × 6 cm",
    startingBid: 80,
    currentBid: 80,
    bidCount: 0,
    topBidder: {
      brand: "",
      url: "",
      logo: "",
    },
    coords2d: {
      top: "19.3%",
      left: "22.3%",
      width: "22.0%",
      height: "12.1%",
    },
    coords3d: {
      top: "21.2%",
      left: "27.6%",
      width: "17.2%",
      height: "9.2%",
      rotateX: "16deg",
      rotateY: "-3deg",
      rotateZ: "2deg",
      skewY: "-2deg",
      skewX: "-22deg",
    },
    description: "Positioned at the upper left of the top leather flap. Highly noticeable at eye level in transit.",
    visibilityNote: "Eye-level visibility in airport security lines and coffee queues.",
    bidsHistory: []
  },
  {
    id: 2,
    label: "Top Flap: Lower Left",
    shortLabel: "Flap Bottom-Left",
    zone: "Top Flap",
    size: "M",
    dimensions: "7 × 4.5 cm",
    startingBid: 50,
    currentBid: 50,
    bidCount: 0,
    topBidder: {
      brand: "",
      url: "",
      logo: "",
    },
    coords2d: {
      top: "32.4%",
      left: "21.8%",
      width: "22.3%",
      height: "9.8%",
    },
    coords3d: {
      top: "32.0%",
      left: "21.8%",
      width: "19.0%",
      height: "8.1%",
      rotateX: "10deg",
      rotateY: "-25deg",
      rotateZ: "10deg",
      skewY: "-3deg",
      skewX: "-1deg",
    },
    description: "Directly below the upper left patch on the main top flap. Clean and subtle placement.",
    visibilityNote: "Direct sightline seen from the side and rear angles.",
    bidsHistory: []
  },
  {
    id: 3,
    label: "Top Flap: Right Side",
    shortLabel: "Flap Right",
    zone: "Top Flap",
    size: "L",
    dimensions: "9 × 6 cm",
    startingBid: 80,
    currentBid: 80,
    bidCount: 0,
    topBidder: {
      brand: "",
      url: "",
      logo: "",
    },
    coords2d: {
      top: "19.3%",
      left: "50.2%",
      width: "21.9%",
      height: "13.1%",
    },
    coords3d: {
      top: "21.6%",
      left: "48.3%",
      width: "18.5%",
      height: "10.0%",
      rotateX: "12deg",
      rotateY: "-6deg",
      rotateZ: "8deg",
      skewY: "-6deg",
      skewX: "-11deg",
    },
    description: "Top right flap zone opposite the left column, giving balanced visual weight.",
    visibilityNote: "Direct glance visibility on the upper right flap.",
    bidsHistory: []
  },
  {
    id: 4,
    label: "Front Pocket: Top Left (2×2 Grid)",
    shortLabel: "Pocket Top-Left",
    zone: "Front Pocket (2×2 Grid)",
    size: "M",
    dimensions: "7 × 6 cm",
    startingBid: 100,
    currentBid: 100,
    bidCount: 0,
    topBidder: {
      brand: "",
      url: "",
      logo: "",
    },
    coords2d: {
      top: "49.5%",
      left: "29.7%",
      width: "14.5%",
      height: "11.9%",
    },
    coords3d: {
      top: "48.9%",
      left: "26.6%",
      width: "13.5%",
      height: "11.9%",
      rotateX: "23deg",
      rotateY: "8deg",
      rotateZ: "-3deg",
      skewY: "-2deg",
      skewX: "-18deg",
    },
    description: "Upper-left quadrant of the main 2×2 front pocket patch grid.",
    visibilityNote: "Primary focal area on the front backpack compartment.",
    bidsHistory: []
  },
  {
    id: 5,
    label: "Front Pocket: Bottom Right (2×2 Grid)",
    shortLabel: "Pocket Bottom-Right",
    zone: "Front Pocket (2×2 Grid)",
    size: "M",
    dimensions: "7 × 6 cm",
    startingBid: 50,
    currentBid: 50,
    bidCount: 0,
    topBidder: {
      brand: "",
      url: "",
      logo: "",
    },
    coords2d: {
      top: "62.7%",
      left: "47.1%",
      width: "14.4%",
      height: "11.3%",
    },
    coords3d: {
      top: "62.3%",
      left: "36.4%",
      width: "14.9%",
      height: "11.5%",
      rotateX: "6deg",
      rotateY: "-19deg",
      rotateZ: "4deg",
      skewY: "-3deg",
      skewX: "-3deg",
    },
    description: "Lower-right quadrant of the main 2×2 front pocket patch grid.",
    visibilityNote: "Balanced lower quadrant placement on the main front pocket.",
    bidsHistory: []
  },
  {
    id: 6,
    label: "Front Pocket: Top Right (2×2 Grid)",
    shortLabel: "Pocket Top-Right",
    zone: "Front Pocket (2×2 Grid)",
    size: "M",
    dimensions: "7 × 6 cm",
    startingBid: 60,
    currentBid: 60,
    bidCount: 0,
    topBidder: {
      brand: "",
      url: "",
      logo: "",
    },
    coords2d: {
      top: "49.8%",
      left: "46.7%",
      width: "14.8%",
      height: "11.9%",
    },
    coords3d: {
      top: "49.6%",
      left: "40.1%",
      width: "13.4%",
      height: "10.8%",
      rotateX: "6deg",
      rotateY: "-18deg",
      rotateZ: "-6deg",
      skewY: "6deg",
      skewX: "-19deg",
    },
    description: "Upper-right quadrant of the main 2×2 front pocket patch grid.",
    visibilityNote: "Front-facing visibility across conferences and subways.",
    bidsHistory: []
  },
  {
    id: 7,
    label: "Front Pocket: Bottom Left (2×2 Grid)",
    shortLabel: "Pocket Bottom-Left",
    zone: "Front Pocket (2×2 Grid)",
    size: "M",
    dimensions: "7 × 6 cm",
    startingBid: 50,
    currentBid: 50,
    bidCount: 0,
    topBidder: {
      brand: "",
      url: "",
      logo: "",
    },
    coords2d: {
      top: "62.6%",
      left: "29.1%",
      width: "15.0%",
      height: "11.2%",
    },
    coords3d: {
      top: "61.7%",
      left: "23.1%",
      width: "13.4%",
      height: "11.2%",
      rotateX: "16deg",
      rotateY: "-20deg",
      rotateZ: "7deg",
      skewY: "-4deg",
      skewX: "2deg",
    },
    description: "Lower-left quadrant of the main 2×2 front pocket patch grid.",
    visibilityNote: "Structured placement above the lower pocket edge.",
    bidsHistory: []
  }
];

export const proofTravelPhotos: ProofPhoto[] = [
  {
    id: "sf-summit",
    city: "San Francisco",
    country: "United States",
    flag: "🇺🇸",
    location: "Moscone Center & Caltrain",
    caption: "Caltrain transit and developer summits across Market Street and South Park.",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop&q=80",
    dateTag: "AI Founders Summit"
  },
  {
    id: "tokyo-transit",
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    location: "Shibuya Crossing & Yamanote Line",
    caption: "High-density pedestrian transit and Shibuya creator hubs.",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
    dateTag: "Tokyo Tech Tour"
  },
  {
    id: "paris-station-f",
    city: "Paris",
    country: "France",
    flag: "🇫🇷",
    location: "Station F & 11th Arrondissement",
    caption: "Europe's largest startup campus and indie developer cafes.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
    dateTag: "Station F Meetup"
  },
  {
    id: "london-shoreditch",
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    location: "Shoreditch High St & Elizabeth Line",
    caption: "Underground commutes and Old Street roundabout tech community.",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80",
    dateTag: "London Tech Week"
  },
  {
    id: "lisbon-nomads",
    city: "Lisbon",
    country: "Portugal",
    flag: "🇵🇹",
    location: "Cais do Sodré & Web Summit Arena",
    caption: "Nomad co-living lounges, oceanfront coworks, and Web Summit expo floor.",
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&auto=format&fit=crop&q=80",
    dateTag: "Web Summit"
  },
  {
    id: "singapore-changi",
    city: "Singapore",
    country: "Singapore",
    flag: "🇸🇬",
    location: "Changi Jewel & Marina Bay Hubs",
    caption: "High-density global transit terminal and Southeast Asian tech conferences.",
    image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&auto=format&fit=crop&q=80",
    dateTag: "SEA Founders Run"
  }
];

export const travelDestinations = [
  { city: "Indonesia", event: "Bali & Jakarta · Nomad co-living & tech hubs", flag: "🇮🇩" },
  { city: "Thailand", event: "Bangkok & Chiang Mai · Nomad hubs & creator spaces", flag: "🇹🇭" },
  { city: "Vietnam", event: "Ho Chi Minh City & Da Nang · Hacker houses & indie cafes", flag: "🇻🇳" },
  { city: "Japan", event: "Tokyo & Shibuya · Tech hubs, metro transit & events", flag: "🇯🇵" },
];

export const faqItems = [
  {
    q: "Is this real?",
    a: "100% real. The leather backpack is my everyday bag. Every winning sponsor gets a durable embroidered patch or laser-engraved leather badge stitched onto their spot. Your patch travels with me across Indonesia, Thailand, Vietnam, Japan, and international tech hubs."
  },
  {
    q: "Why a backpack?",
    a: "A laptop only gets seen when open in a cafe. A backpack is constantly on the move: walking through airports, sitting in overhead bins, standing on escalators, and during tech meetups. It gets seen by thousands of people in transit."
  },
  {
    q: "What do I get as a sponsor?",
    a: "1) A physical custom patch stitched on the backpack that travels everywhere with me.\n2) A permanent dofollow backlink and logo placement on this site.\n3) Tagged photos and mentions across my build-in-public posts and social updates on X and LinkedIn."
  },
  {
    q: "How does the bidding & deposit work?",
    a: "Placing a bid requires a 20% refundable deposit (minimum €15 / $16) by card. If you are outbid and do not win by the end of the auction, your deposit is refunded automatically in full. If you win, your deposit applies to your final total."
  },
  {
    q: "What if someone outbids me?",
    a: "Outbids require at least a +€10 / +$10 increment over the top bid. You will get an instant email notification if someone places a higher bid, giving you the chance to counter-bid."
  },
  {
    q: "Can any brand bid?",
    a: "Startups, developer tools, SaaS companies, creators, and agencies are welcome. We manually review submissions to maintain high aesthetic standards. Adult, gambling, or harmful content will be rejected and refunded immediately."
  },
  {
    q: "Can I do this with my own backpack or gear?",
    a: "Yes. We are building a platform for digital nomads, creators, and athletes to run auctions on their gear. Join the waitlist at the bottom of this page."
  }
];
