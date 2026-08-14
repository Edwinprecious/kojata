// src/utils/slug.js
// Single source of truth for turning a category NAME into a URL-safe slug.
// Used by Navbar (dropdown links), Home (category tiles) and CategoryPage
// (matching the slug back to a category) so they always agree with each other,
// no matter what categories exist in the database.

export function slugify(name = '') {
  return name
    .toString()
    .toLowerCase()
    .replace(/&/g, 'and')
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // any run of non-alphanumeric chars -> single hyphen
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
}