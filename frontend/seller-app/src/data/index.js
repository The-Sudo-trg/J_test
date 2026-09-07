export const stores = [
  { id: 'fresh-basket', name: 'Fresh Basket', type: 'Fruit, veg & everyday essentials', rating: 4.8, delivery: '18–25 min', distance: '0.8 km', status: 'Open', accent: 'peach', emoji: '🥬', orders: 14, packing: '7 min' },
  { id: 'corner-pantry', name: 'Corner Pantry', type: 'Snacks, pantry & household', rating: 4.7, delivery: '20–27 min', distance: '1.2 km', status: 'Open', accent: 'sun', emoji: '🥫', orders: 9, packing: '9 min' },
  { id: 'daily-dairy', name: 'Daily Dairy', type: 'Milk, eggs & breakfast', rating: 4.9, delivery: '16–23 min', distance: '0.6 km', status: 'Open', accent: 'mint', emoji: '🥛', orders: 11, packing: '5 min' },
  { id: 'daily-mart', name: 'Daily Mart', type: 'Home and kitchen essentials', rating: 4.6, delivery: '23–30 min', distance: '1.7 km', status: 'Paused', accent: 'sky', emoji: '🧼', orders: 0, packing: '—' },
  { id: 'bread-room', name: 'The Bread Room', type: 'Freshly baked breads & treats', rating: 4.9, delivery: '21–28 min', distance: '1.1 km', status: 'Open', accent: 'rose', emoji: '🥖', orders: 6, packing: '8 min' },
  { id: 'green-mile', name: 'Green Mile', type: 'Organic fruit & vegetables', rating: 4.7, delivery: '24–31 min', distance: '2.0 km', status: 'Open', accent: 'leaf', emoji: '🥑', orders: 7, packing: '10 min' },
];

export const products = [
  { id: 'bananas', name: 'Farm bananas', unit: '1 kg', price: 68, category: 'Fruits & veg', storeId: 'fresh-basket', emoji: '🍌', stock: 18, badge: 'Popular' },
  { id: 'milk', name: 'Nandini fresh milk', unit: '1 L', price: 31, category: 'Dairy & eggs', storeId: 'daily-dairy', emoji: '🥛', stock: 7, badge: 'Daily essential' },
  { id: 'avocado', name: 'Hass avocado', unit: '2 pieces', price: 119, category: 'Fruits & veg', storeId: 'green-mile', emoji: '🥑', stock: 11, badge: 'Organic' },
  { id: 'bread', name: 'Sourdough loaf', unit: '400 g', price: 95, category: 'Bakery', storeId: 'bread-room', emoji: '🥖', stock: 9, badge: 'Baked today' },
  { id: 'cookies', name: 'Butter cookies', unit: '200 g', price: 85, category: 'Snacks', storeId: 'corner-pantry', emoji: '🍪', stock: 20, badge: 'Favourite' },
  { id: 'tomato', name: 'Red tomatoes', unit: '500 g', price: 34, category: 'Fruits & veg', storeId: 'fresh-basket', emoji: '🍅', stock: 5, badge: 'Fresh today' },
  { id: 'rice', name: 'Sona masoori rice', unit: '1 kg', price: 82, category: 'Pantry', storeId: 'corner-pantry', emoji: '🍚', stock: 13, badge: 'Value pack' },
  { id: 'soap', name: 'Plant-based dish soap', unit: '500 ml', price: 109, category: 'Household', storeId: 'daily-mart', emoji: '🧴', stock: 16, badge: 'Eco pick' },
  { id: 'eggs', name: 'Free-range eggs', unit: '6 pieces', price: 89, category: 'Dairy & eggs', storeId: 'daily-dairy', emoji: '🥚', stock: 10, badge: 'Local farm' },
  { id: 'spinach', name: 'Baby spinach', unit: '250 g', price: 52, category: 'Fruits & veg', storeId: 'green-mile', emoji: '🥬', stock: 6, badge: 'Organic' },
];

export const categories = [
  { name: 'Fruits & veg', emoji: '🍎', colour: 'blush' },
  { name: 'Dairy & eggs', emoji: '🥛', colour: 'aqua' },
  { name: 'Pantry', emoji: '🥫', colour: 'sunny' },
  { name: 'Bakery', emoji: '🥖', colour: 'sand' },
  { name: 'Snacks', emoji: '🍪', colour: 'lavender' },
  { name: 'Household', emoji: '🧼', colour: 'minty' },
];

export const seedOrders = [
  { id: 'NB-10428', customer: 'Ananya Rao', items: 4, amount: 382, storeId: 'fresh-basket', status: 'new', delivery: 'ASAP', rider: 'Unassigned', created: '2 min ago' },
  { id: 'NB-10426', customer: 'Milan Patel', items: 7, amount: 791, storeId: 'fresh-basket', status: 'packing', delivery: 'ASAP', rider: 'Ravi Kumar', created: '7 min ago' },
  { id: 'NB-10421', customer: 'Dev Shah', items: 3, amount: 244, storeId: 'fresh-basket', status: 'ready', delivery: 'ASAP', rider: 'Ravi Kumar', created: '14 min ago' },
  { id: 'NB-10412', customer: 'Nisha Gupta', items: 5, amount: 468, storeId: 'corner-pantry', status: 'out_for_delivery', delivery: 'ASAP', rider: 'Sana Sheikh', created: '25 min ago' },
  { id: 'NB-10404', customer: 'Kabir Malhotra', items: 2, amount: 169, storeId: 'daily-dairy', status: 'delivered', delivery: 'ASAP', rider: 'Priya Nair', created: '42 min ago' },
];

export const riders = [
  { id: 'ravi', name: 'Ravi Kumar', rating: 4.9, deliveries: 1240, status: 'Picking up', zone: 'Koramangala 4th Block', activeOrder: 'NB-10426', emoji: '🛵' },
  { id: 'sana', name: 'Sana Sheikh', rating: 4.8, deliveries: 982, status: 'On delivery', zone: 'Koramangala 5th Block', activeOrder: 'NB-10412', emoji: '🛵' },
  { id: 'priya', name: 'Priya Nair', rating: 5.0, deliveries: 721, status: 'Available', zone: 'Koramangala 3rd Block', activeOrder: null, emoji: '🛵' },
  { id: 'aman', name: 'Aman Khan', rating: 4.7, deliveries: 688, status: 'Available', zone: 'Koramangala 7th Block', activeOrder: null, emoji: '🛵' },
];

export const statusMeta = {
  new: { label: 'New', tone: 'amber' },
  accepted: { label: 'Accepted', tone: 'blue' },
  packing: { label: 'Packing', tone: 'green' },
  ready: { label: 'Ready for rider', tone: 'violet' },
  assigned: { label: 'Rider assigned', tone: 'blue' },
  out_for_delivery: { label: 'Out for delivery', tone: 'violet' },
  delivered: { label: 'Delivered', tone: 'slate' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};
