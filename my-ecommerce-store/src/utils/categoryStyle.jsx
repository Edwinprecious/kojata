// src/utils/categoryStyle.jsx
// Single source of truth for how a category is presented: which icon and colour
// it gets, and how its name is cased. Previously icons were assigned by array
// index (CATEGORY_STYLES[i % len]), so "Games" could end up with a watch icon
// purely because of the order the API returned rows in.

import React from 'react';
import {
  Laptop, Shirt, Gamepad2, Hammer, Sparkles, Gem, Home, Armchair,
  Gift, Footprints, Watch, Headphones, Book, Dumbbell, Package, Tag,
} from 'lucide-react';

// Matched in order, so put the more specific keywords first.
const CATEGORY_MATCHERS = [
  { keywords: ['electronic', 'tech', 'gadget', 'computer'], icon: Laptop,     color: 'text-orange-500' },
  { keywords: ['fashion', 'clothes', 'clothing', 'apparel', 'wear'], icon: Shirt, color: 'text-pink-500' },
  { keywords: ['game', 'gaming', 'console'],                 icon: Gamepad2,  color: 'text-indigo-500' },
  { keywords: ['hand-craft', 'handcraft', 'handmade', 'craft', 'artisan'], icon: Hammer, color: 'text-amber-600' },
  { keywords: ['self-care', 'selfcare', 'beauty', 'skincare', 'wellness'], icon: Sparkles, color: 'text-purple-500' },
  { keywords: ['jewel', 'accessor'],                         icon: Gem,       color: 'text-fuchsia-500' },
  { keywords: ['furniture', 'sofa', 'chair'],                icon: Armchair,  color: 'text-yellow-700' },
  { keywords: ['house', 'home', 'kitchen', 'decor'],         icon: Home,      color: 'text-green-500' },
  { keywords: ['gift', 'present'],                           icon: Gift,      color: 'text-red-500' },
  { keywords: ['shoe', 'footwear', 'sneaker', 'boot'],       icon: Footprints, color: 'text-slate-500' },
  { keywords: ['watch', 'timepiece'],                        icon: Watch,     color: 'text-blue-500' },
  { keywords: ['audio', 'headphone', 'sound', 'music'],      icon: Headphones, color: 'text-cyan-600' },
  { keywords: ['book', 'read', 'stationery'],                icon: Book,      color: 'text-emerald-600' },
  { keywords: ['sport', 'fitness', 'gym', 'outdoor'],        icon: Dumbbell,  color: 'text-lime-600' },
  { keywords: ['deal', 'sale', 'clearance'],                 icon: Tag,       color: 'text-rose-500' },
];

const FALLBACK = { icon: Package, color: 'text-gray-500' };

export function getCategoryStyle(name = '', size = 16) {
  const haystack = name.toString().toLowerCase();
  const match = CATEGORY_MATCHERS.find(({ keywords }) =>
    keywords.some((k) => haystack.includes(k))
  ) || FALLBACK;

  const Icon = match.icon;
  return { icon: <Icon size={size} />, color: match.color };
}

// Words that stay lowercase unless they lead the name.
const MINOR_WORDS = new Set([
  'and', 'or', 'the', 'of', 'for', 'to', 'a', 'an', 'in', 'on', 'with', 'by',
]);

const capitalise = (word) =>
  word ? word.charAt(0).toUpperCase() + word.slice(1) : word;

// "jewelry and accessories" -> "Jewelry and Accessories"
// "hand-crafted"            -> "Hand-crafted"
// "HOUSE TO HOME"           -> "House to Home"
export function formatCategoryName(name = '') {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (i > 0 && MINOR_WORDS.has(word)) return word;
      // Only the first segment of a hyphenated word is capitalised.
      return word
        .split('-')
        .map((part, j) => (j === 0 ? capitalise(part) : part))
        .join('-');
    })
    .join(' ');
}