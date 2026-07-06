const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Request = require('../../models/Request');

const sampleRequests = [
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
    imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=400&h=300', // standard stock placeholder for demo visual appeal
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
  {
    title: 'Hospital Waste Accumulation',
    description: 'Medical waste and trash pile accumulates near the back entrance of City General Hospital. Dogs are scattering it.',
    location: {
      type: 'Point',
      coordinates: [77.5930, 12.9725],
      address: 'Cubbon Road, Behind City General Hospital, Bengaluru'
    },
    category: 'sanitation',
    sentiment: 'angry',
    urgencyScore: 9,
    priorityScore: 95,
    aiRecommendation: 'Biohazard hazard in direct proximity to a healthcare facility. Elevated safety risk. Clean-up crew needed within 24 hours.',
    inputMethod: 'text',
    duplicateCount: 8,
    nearbyInfrastructure: ["City General Hospital (hospital)"],
    status: 'pending'
  },
  {
    title: 'Primary School Roof Leaking',
    description: 'Leaking ceiling in the main classroom of M. G. Road Primary School during monsoons. Kids cannot study.',
    location: {
      type: 'Point',
      coordinates: [77.6010, 12.9730],
      address: 'MG Road School Block, Bengaluru'
    },
    category: 'education',
    sentiment: 'negative',
    urgencyScore: 7,
    priorityScore: 78,
    aiRecommendation: 'Direct impact on active education center. Urgently schedule structural roof patching.',
    inputMethod: 'text',
    duplicateCount: 2,
    nearbyInfrastructure: ["M. G. Road Primary School (school)"],
    status: 'under-review'
  },
  {
    title: 'Open Manhole on Sidewalk',
    description: 'An open manhole is left uncovered on the footpath. Extremely dangerous for children and pedestrians.',
    location: {
      type: 'Point',
      coordinates: [77.5990, 12.9700],
      address: 'Lavelle Road Footpath, Bengaluru'
    },
    category: 'roads',
    sentiment: 'angry',
    urgencyScore: 10,
    priorityScore: 98,
    aiRecommendation: 'Severe hazard with threat to human life. Highly populated shopping corridor. Urgent response team dispatched.',
    inputMethod: 'text',
    duplicateCount: 19,
    nearbyInfrastructure: ["Lavelle Road Children Hospital (hospital)", "St. Mark's School (school)"],
    status: 'processing'
  },
  {
    title: 'Sewage Line Blockage',
    description: 'Sewer water is bubbling out from the main drain onto Bowring Hospital Road. Severe foul smell.',
    location: {
      type: 'Point',
      coordinates: [77.6030, 12.9830],
      address: 'Bowring Hospital Road, Bengaluru'
    },
    category: 'sanitation',
    sentiment: 'angry',
    urgencyScore: 8,
    priorityScore: 86,
    aiRecommendation: 'Sanitation overflow near public health center. Promotes disease vectors. Issue work order for sanitation jetting.',
    inputMethod: 'voice',
    audioTranscript: 'Yes, sewage water is bubbling out on Bowring Hospital Road. The smell is awful, please clean it up.',
    duplicateCount: 5,
    nearbyInfrastructure: ["Bowring Hospital (hospital)"],
    status: 'pending'
  },
  {
    title: 'Hanging Power Cables',
    description: 'Loose high voltage electric wires are hanging low from a pole. Heavy rain could cause electrocution.',
    location: {
      type: 'Point',
      coordinates: [77.6200, 12.9350],
      address: 'Koramangala 4th Block, Bengaluru'
    },
    category: 'electricity',
    sentiment: 'angry',
    urgencyScore: 9,
    priorityScore: 89,
    aiRecommendation: 'Critical electrical hazard. Risk of shock or fire. Electrical board must secure live lines immediately.',
    inputMethod: 'text',
    duplicateCount: 11,
    nearbyInfrastructure: ["Koramangala Water Tank (water point)"],
    status: 'pending'
  },
  {
    title: 'Cantonment Water Shortage',
    description: 'No municipal drinking water supply in Cantonment ward for the last 5 days. Citizens are relying on expensive private tankers.',
    location: {
      type: 'Point',
      coordinates: [77.5970, 12.9920],
      address: 'Cantonment Area, Bengaluru'
    },
    category: 'water',
    sentiment: 'negative',
    urgencyScore: 7,
    priorityScore: 75,
    aiRecommendation: 'Basic utility shortage affecting multiple households. Requires review of ward distribution valves.',
    inputMethod: 'text',
    duplicateCount: 22,
    nearbyInfrastructure: ["Cantonment School (school)"],
    status: 'under-review'
  },
  {
    title: 'PHC Staff Absenteeism',
    description: 'Primary Health Center in Wilson Garden has no doctor present during scheduled morning hours. Patients are waiting outside in pain.',
    location: {
      type: 'Point',
      coordinates: [77.5950, 12.9400],
      address: 'Wilson Garden PHC, Bengaluru'
    },
    category: 'health',
    sentiment: 'angry',
    urgencyScore: 8,
    priorityScore: 82,
    aiRecommendation: 'Healthcare delivery failure. Public service administrative review required immediately.',
    inputMethod: 'text',
    duplicateCount: 4,
    nearbyInfrastructure: ["Wilson Garden PHC (hospital)"],
    status: 'pending'
  },
  {
    title: 'Garbage Dump near Water Reservoir',
    description: 'Large public garbage pile dumping is occurring daily near the Cubbon Park Metro Water Reservoir. Risk of water contamination.',
    location: {
      type: 'Point',
      coordinates: [77.5960, 12.9750],
      address: 'Cubbon Park, Near Metro Reservoir, Bengaluru'
    },
    category: 'sanitation',
    sentiment: 'negative',
    urgencyScore: 8,
    priorityScore: 84,
    aiRecommendation: 'Threat to major water security asset. Block site dumping and schedule immediate cleanup.',
    inputMethod: 'text',
    duplicateCount: 7,
    nearbyInfrastructure: ["Cubbon Park Metro Water Reservoir (water point)", "City General Hospital (hospital)"],
    status: 'processing'
  },
  {
    title: 'Pothole on School Crossing',
    description: 'A deep pothole has formed right on the pedestrian crossing where children cross to enter St. Mark\'s School.',
    location: {
      type: 'Point',
      coordinates: [77.5960, 12.9710],
      address: 'St. Mark\'s School Crossing, Bengaluru'
    },
    category: 'roads',
    sentiment: 'negative',
    urgencyScore: 7,
    priorityScore: 80,
    aiRecommendation: 'Safety threat to school children. Priority road patching scheduled.',
    inputMethod: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&h=300',
    duplicateCount: 5,
    nearbyInfrastructure: ["St. Mark's School (school)", "City General Hospital (hospital)"],
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
    console.log(`Successfully seeded ${seeded.length} realistic citizen requests!`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed demo requests:', error.message);
    process.exit(1);
  }
};

seedDemoData();
