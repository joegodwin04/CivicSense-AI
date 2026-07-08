const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Request = require('../../models/Request');

const sampleRequests = [
  // --- Bengaluru Central ---
  {
    title: 'Severe Potholes on MG Road',
    description: 'Deep potholes on MG Road right outside the Metro Station. Multiple motorbikes have slipped during rains.',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
      address: 'MG Road Metro Station, Bengaluru'
    },
    category: 'roads',
    sentiment: 'angry',
    urgencyScore: 8,
    priorityScore: 92,
    aiRecommendation: 'Critical roadway hazard near main transit hub. High accident probability. Immediate resurfacing required.',
    inputMethod: 'text',
    duplicateCount: 14,
    nearbyInfrastructure: ["City General Hospital (hospital)", "St. Mark's School (school)"],
    status: 'under-review'
  },
  {
    title: 'Water Main Burst',
    description: 'A major water supply pipe has burst on Richmond Road. Thousands of liters of water are wasting and flooding the street.',
    location: {
      type: 'Point',
      coordinates: [77.5850, 12.9650],
      address: 'Richmond Road, Bengaluru'
    },
    category: 'water',
    sentiment: 'negative',
    urgencyScore: 9,
    priorityScore: 88,
    aiRecommendation: 'Major infrastructure failure causing resource loss and localized flooding. Dispatch municipal engineers.',
    inputMethod: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=400&h=300',
    duplicateCount: 6,
    nearbyInfrastructure: ["Richmond Road Maternity Hospital (hospital)"],
    status: 'processing'
  },
  {
    title: 'Broken Streetlights',
    description: 'Entire block of streetlights is non-functional near Kanteerava Sports Complex. Very dark and unsafe for women walking at night.',
    location: {
      type: 'Point',
      coordinates: [77.5910, 12.9680],
      address: 'Kanteerava Sports Stadium Road, Bengaluru'
    },
    category: 'electricity',
    sentiment: 'negative',
    urgencyScore: 6,
    priorityScore: 68,
    aiRecommendation: 'Security threat in high-footfall area. Requires routine electrical repairs and utility pole service.',
    inputMethod: 'text',
    duplicateCount: 3,
    nearbyInfrastructure: ["Kanteerava Public Sports School (school)"],
    status: 'pending'
  },

  // --- Mumbai South ---
  {
    title: 'Flooded CST Underpass',
    description: 'Monsoon water accumulation inside the CST underpass has halted vehicular traffic and pedestrian walkways.',
    location: {
      type: 'Point',
      coordinates: [72.8360, 18.9400],
      address: 'CST Underpass, Mumbai South'
    },
    category: 'roads',
    sentiment: 'angry',
    urgencyScore: 9,
    priorityScore: 94,
    aiRecommendation: 'Severe flooding in central municipal corridor. Deploy drainage pump trucks immediately.',
    inputMethod: 'text',
    duplicateCount: 22,
    nearbyInfrastructure: ["St. George Hospital (hospital)"],
    status: 'pending'
  },
  {
    title: 'Hanging Utility Cables near Marine Drive',
    description: 'Loose overhead internet and power cables hanging low onto the pedestrian walkway, causing electrocution hazard.',
    location: {
      type: 'Point',
      coordinates: [72.8200, 18.9430],
      address: 'Marine Drive Promenade, Mumbai South'
    },
    category: 'electricity',
    sentiment: 'negative',
    urgencyScore: 7,
    priorityScore: 78,
    aiRecommendation: 'Electrical wiring violation near prime tourist zone. Contact public electrical board for urgent remediation.',
    inputMethod: 'text',
    duplicateCount: 5,
    nearbyInfrastructure: ["Marine Drive Police Chowky (police)"],
    status: 'under-review'
  },

  // --- New Delhi ---
  {
    title: 'Sewage Overflow in Connaught Place',
    description: 'Blockage in commercial main sewer line has resulted in raw sewage water overflowing into block parking spaces.',
    location: {
      type: 'Point',
      coordinates: [77.2197, 28.6304],
      address: 'Block E, Connaught Place, New Delhi'
    },
    category: 'sanitation',
    sentiment: 'angry',
    urgencyScore: 8,
    priorityScore: 89,
    aiRecommendation: 'Hazardous sanitation overflow in highly commercial sector. Direct municipal vacuum trucks to clean and flush sewer blockages.',
    inputMethod: 'text',
    duplicateCount: 11,
    nearbyInfrastructure: ["CP Metro Clinic (hospital)"],
    status: 'processing'
  },
  {
    title: 'Potholes on Ring Road',
    description: 'Huge crater-like potholes near Lajpat Nagar flyover. Posing major risks for heavy traffic and fast vehicles.',
    location: {
      type: 'Point',
      coordinates: [77.2435, 28.5708],
      address: 'Lajpat Nagar Ring Road, New Delhi'
    },
    category: 'roads',
    sentiment: 'negative',
    urgencyScore: 8,
    priorityScore: 85,
    aiRecommendation: 'High-speed transit hazard. Schedule cold-mix asphalt overlay work overnight.',
    inputMethod: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&h=300',
    duplicateCount: 7,
    nearbyInfrastructure: ["Lajpat Nagar Metro Station (transit)"],
    status: 'pending'
  },

  // --- Chennai Central ---
  {
    title: 'Water Quality Issue in T. Nagar',
    description: 'Drinking tap water is yellowish-brown and smells strongly of rust and sewage. Affecting multiple housing societies.',
    location: {
      type: 'Point',
      coordinates: [80.2337, 13.0405],
      address: 'T. Nagar Residential Area, Chennai'
    },
    category: 'water',
    sentiment: 'angry',
    urgencyScore: 9,
    priorityScore: 91,
    aiRecommendation: 'Suspected public health containment leakage. Take sample tests immediately and cross-inspect sewer grid overlays.',
    inputMethod: 'voice',
    audioTranscript: 'Yes, the water coming from our taps in T. Nagar is completely dirty and stinking. We cannot drink this.',
    duplicateCount: 18,
    nearbyInfrastructure: ["T. Nagar Primary School (school)"],
    status: 'under-review'
  },
  {
    title: 'Illegal Garbage Dump near Marina Beach',
    description: 'Trash pile accumulation on beach borders. Piles are rotting and attracting stray dogs.',
    location: {
      type: 'Point',
      coordinates: [80.2825, 13.0490],
      address: 'Marina Beach Road, Chennai'
    },
    category: 'sanitation',
    sentiment: 'negative',
    urgencyScore: 7,
    priorityScore: 73,
    aiRecommendation: 'Environmental cleanup required. Setup trash collection bins and execute sanitation sweep.',
    inputMethod: 'text',
    duplicateCount: 4,
    nearbyInfrastructure: ["Marina Beach Public Hospital (hospital)"],
    status: 'pending'
  },

  // --- Kolkata Uttar ---
  {
    title: 'Broken Streetlights near Howrah Bridge Road',
    description: 'Street lighting is non-functional over 200m stretch. Total darkness creates security concerns during night hours.',
    location: {
      type: 'Point',
      coordinates: [88.3476, 22.5851],
      address: 'Howrah Bridge Approach Road, Kolkata'
    },
    category: 'electricity',
    sentiment: 'negative',
    urgencyScore: 7,
    priorityScore: 79,
    aiRecommendation: 'Traffic corridor safety concern. Coordinate quick electrical fuse replacements with regional utility provider.',
    inputMethod: 'text',
    duplicateCount: 9,
    nearbyInfrastructure: ["Howrah Primary Clinic (hospital)"],
    status: 'processing'
  },
  {
    title: 'Potholes on Bidhan Sarani',
    description: 'Road craters near main tram crossing causing heavy vehicle slow-downs and transit delays.',
    location: {
      type: 'Point',
      coordinates: [88.3670, 22.5920],
      address: 'Bidhan Sarani Tram Crossing, Kolkata'
    },
    category: 'roads',
    sentiment: 'negative',
    urgencyScore: 6,
    priorityScore: 70,
    aiRecommendation: 'Transit tracking delay indicator. Perform asphalt patching and secure adjacent streetcar rails.',
    inputMethod: 'text',
    duplicateCount: 3,
    nearbyInfrastructure: ["Kolkata North High School (school)"],
    status: 'resolved'
  }
];

const seedDemoData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not set in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding demo data...');

    // Clear existing requests
    await Request.deleteMany({});
    console.log('Cleared old requests.');

    // Insert demo requests
    const seeded = await Request.insertMany(sampleRequests);
    console.log(`Successfully seeded ${seeded.length} realistic citizen requests across India!`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed demo requests:', error.message);
    process.exit(1);
  }
};

seedDemoData();
