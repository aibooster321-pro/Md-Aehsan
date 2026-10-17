export interface CampusCategory {
  id: string;
  name: string;
  shortDesc: string;
  icon: string;
  color: string;
  bgLight: string;
}

export const CAMPUS_CATEGORIES: CampusCategory[] = [
  {
    id: 'anti-ragging',
    name: 'Anti-Ragging & Safety',
    shortDesc: 'Immediate escalation, physical security, guards & campus discipline',
    icon: 'ShieldAlert',
    color: 'text-rose-600',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  {
    id: 'classroom',
    name: 'Classroom & Smartboard',
    shortDesc: 'Projectors, digital boards, podium mics, markers & desk lighting',
    icon: 'Monitor',
    color: 'text-blue-600',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    id: 'electrical',
    name: 'Fan, AC & Electrical',
    shortDesc: 'Ceiling fans, air conditioning, power sockets & corridor lights',
    icon: 'Zap',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  {
    id: 'furniture',
    name: 'Furniture & Lab Damage',
    shortDesc: 'Benches, computers, lab equipment, oscilloscopes & broken chairs',
    icon: 'Wrench',
    color: 'text-yellow-600',
    bgLight: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  {
    id: 'sports',
    name: 'Playground & Sports Kit',
    shortDesc: 'Ground maintenance, cricket turf, basketball hoops & sports gear',
    icon: 'Trophy',
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    id: 'hostel',
    name: 'Hostel & Mess Food',
    shortDesc: 'Room hygiene, wardens, food quality, mess menu & hostel facilities',
    icon: 'Utensils',
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    id: 'exams',
    name: 'Exams & Hall Tickets',
    shortDesc: 'Admit cards, semester results, roll number corrections & internal marks',
    icon: 'FileText',
    color: 'text-purple-600',
    bgLight: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    id: 'fees',
    name: 'Fee Accounts & Scholarships',
    shortDesc: 'Tuition fees receipt, UP scholarship forms, refunds & fee dues',
    icon: 'CreditCard',
    color: 'text-teal-600',
    bgLight: 'bg-teal-50 border-teal-200 text-teal-700',
  },
  {
    id: 'transport',
    name: 'Bus & Campus Transport',
    shortDesc: 'Route timings, driver behavior, bus pass & Noida/Delhi connectivity',
    icon: 'Bus',
    color: 'text-orange-600',
    bgLight: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  {
    id: 'sanitation',
    name: 'Sanitation & Water Cooler',
    shortDesc: 'Restroom cleanliness, RO drinking water, water dispenser servicing',
    icon: 'Droplet',
    color: 'text-cyan-600',
    bgLight: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  },
];
