// This small, read-only catalogue is shared by the Cloudflare delivery layer.
// Keep its customer-facing product details in sync with the local storefront.
export const products = [
  {
    id: 'signature', name: 'Multiflora Honey', collection: 'Our Bestseller', price: 249, size: '250 g', color: '#113c2e', accent: '#d7ad45', note: 'Raw multiflora honey', image: '/assets/Multiflora%20honey.png',
    gallery: ['/assets/multiflora%20honey%20png.png', '/assets/multiflora%20honey%202.png', '/assets/multiflora%20honey%203.png', '/assets/multiflora%20honey%204.png'],
    variants: [{ size: '250 g', price: 249 }, { size: '500 g', price: 499 }, { size: '1 kg', price: 899 }],
    description: 'A nuanced, golden harvest with a rounded floral finish. Made for slow breakfasts, cheese boards, warm toast and everyday rituals.',
    details: ['Unheated & minimally filtered', 'Multi-floral nectar', 'Premium glass jar'],
    why: ['Balanced floral taste that works with almost everything', 'Perfect first jar for new Nectra customers', 'Raw-style texture with a naturally rich aroma']
  },
  {
    id: 'blush', name: 'Skincare and Beauty Honey', collection: 'Skin & Beauty', price: 249, size: '250 g', color: '#dc9eaa', accent: '#b9851c', note: 'Beauty blend', image: '/assets/Skincare%20and%20Beauty%20Honey.png',
    gallery: ['/assets/skincare%20and%20beauty%20honey%20png.png', '/assets/skin%20honey%202.png', '/assets/skin%20honey%203.png', '/assets/skin%20honey%204.png'],
    variants: [{ size: '250 g', price: 249 }, { size: '500 g', price: 499 }, { size: '1 kg', price: 899 }],
    description: 'A delicate botanical honey made to brighten your daily self-care moment, from face masks to warm tea.',
    details: ['Floral and delicate', 'Beauty ritual companion', 'Premium glass jar'],
    why: ['Soft floral notes for gentle daily rituals', 'Pairs beautifully with rose, yoghurt and oats', 'Designed for both sipping and skincare-inspired DIY moments'],
    recipe: { title: 'Glowy skin ritual maker', base: ['Curd', 'Aloe gel', 'Oats'], add: ['Rose water', 'Turmeric pinch', 'Saffron milk'], result: 'Mix 1 tsp Nectra Beauty Honey with your selected base and add-in. Apply for 8-10 minutes, rinse gently, then moisturise.' }
  },
  {
    id: 'vital', name: 'Energy Honey', collection: 'Energy', price: 349, size: '250 g', color: '#df781e', accent: '#fae0a1', note: 'Energy blend', image: '/assets/energy%20honey.png',
    gallery: ['/assets/energy%20honey%20png.png', '/assets/energy%20honey%202.png', '/assets/energy%20honey%203.png', '/assets/energy%20honey%204.png'],
    variants: [{ size: '250 g', price: 349 }, { size: '500 g', price: 599 }, { size: '1 kg', price: 999 }],
    description: 'A vivid, energising honey blend for early starts, workouts and every hour that asks for more of you.',
    details: ['Bright ginger-citrus mood', 'Pre-workout companion', 'Premium glass jar'],
    why: ['Bold taste that wakes up lemon water and smoothies', 'A clean sweetener for active mornings', 'Built for quick rituals before busy days']
  },
  {
    id: 'verdant', name: 'Health and Immunity Honey', collection: 'Health & Immunity', price: 349, size: '250 g', color: '#8ebd70', accent: '#e4c76b', note: 'Wellness blend', image: '/assets/Health%20and%20Immunity%20Honey.png',
    gallery: ['/assets/health%20and%20immunity%20honey%20png.png', '/assets/health%20honey%202.png', '/assets/health%20honey%203.png', '/assets/health%20and%20immunity%20honey%20botanical%20feature.png'],
    variants: [{ size: '250 g', price: 349 }, { size: '500 g', price: 599 }, { size: '1 kg', price: 999 }],
    description: 'A fresh, herbaceous honey designed for mindful daily nourishment and seasonal rituals.',
    details: ['Herbal profile', 'Daily wellness ritual', 'Premium glass jar'],
    why: ['Comforting with warm water, tulsi and lemon', 'A thoughtful jar for family wellness shelves', 'Fresh green label language for immunity-led positioning'],
    recipe: { title: 'Wellness cup maker', base: ['Warm water', 'Green tea', 'Tulsi tea'], add: ['Lemon', 'Ginger', 'Black pepper pinch'], result: 'Stir 1 tsp Nectra Health Honey into a warm, not boiling, cup with your selected add-in. Sip slowly as a daily comfort ritual.' }
  },
  {
    id: 'serene', name: 'Calm Honey', collection: 'Calm', price: 249, size: '250 g', color: '#b09ac5', accent: '#e7ca7b', note: 'Calming blend', image: '/assets/Calm%20Honey.png',
    gallery: ['/assets/calm%20honey%20png.png', '/assets/calm%20honey%202.png', '/assets/calm%20honey%203.png', '/assets/calm%20honey%204.png'],
    variants: [{ size: '250 g', price: 249 }, { size: '500 g', price: 499 }, { size: '1 kg', price: 899 }],
    description: 'A gentle lavender-kissed honey for quiet evenings, moonlit teas and slowing the day down.',
    details: ['Lavender-inspired profile', 'Evening ritual companion', 'Premium glass jar'],
    why: ['Elegant flavour for chamomile, milk and dessert drizzles', 'A calm visual world for night-time gifting', 'Made to turn the last cup of the day into a little ceremony']
  }
];
