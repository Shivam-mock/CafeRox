/* ============================================================
   CAFE ROX — MENU DATA
   ============================================================
   This is the ONLY file you need to edit to change your menu.
g
   - To ADD a product   → copy an existing object in MENU_ITEMS,
                           paste it, give it a new unique "id",
                           and change its details.
   - To REMOVE a product → delete its whole { ... } block.
   - To EDIT a product   → change the values inside its block.
   - To ADD a category   → add a new object to MENU_CATEGORIES,
                           then use its "id" as the "category"
                           value on any product.

   Product images live in:  images/products/
   Just drop a photo there and point "image" at it, e.g.
   "images/products/my-new-drink.jpg"
   ============================================================ */


/* ------------------------------------------------------------
   1. CATEGORIES
   Shown as the filter buttons above the menu grid.
   "id" must be lowercase, no spaces (used internally).
   "label" is what the customer sees on the button.
------------------------------------------------------------ */
const MENU_CATEGORIES = [
  { id: "all",     label: "All Items"   },
  { id: "coffee",  label: "Hot Coffee"  },
  { id: "cold",    label: "Cold Drinks" },
  { id: "shakes",  label: "Shakes"      },
  { id: "snacks",  label: "Snacks"      },
];


/* ------------------------------------------------------------
   2. MENU ITEMS
   Fields:
     id          → unique number, never reuse
     name        → product name shown on the card
     price       → number only, no currency symbol
     category    → must match a category "id" above
     image       → path to the product photo
     description → short line shown under the name (optional)
     available   → set to false to hide an item without deleting it
------------------------------------------------------------ */
const MENU_ITEMS = [
  {
    id: 1,
    name: "Cold Coffee",
    price: 70,
    category: "cold",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmMqkmnLEZTK8bQ9XAfvUqR834bCGnAig5wtwbeVl_xA&s=10",
    description: "Chilled coffee blended with creamy milk",
    available: true,
  },
  {
    id: 2,
    name: "Latte",
    price: 60,
    category: "coffee",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-segfRShzqqc5s9olCqX42sA6ao1xQgg7WmjwxCTBtQ&s=10",
    description: "Smooth espresso with steamed milk foam",
    available: true,
  },
  {
    id: 3,
    name: "Mocha",
    price: 99,
    category: "coffee",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmWgrDZ7DmKXFlcmy80lOLY5EW-getqfkTT6tnFE9O0w&s=10",
    description: "Espresso, chocolate and steamed milk",
    available: true,
  },
  {
    id: 4,
    name: "Cappuccino",
    price: 80,
    category: "coffee",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfXgscfmAgVZdy6_OveIpriTuCUZfCEEs0CaKy5Ixl4Q&s=10",
    description: "Equal parts espresso, milk and foam",
    available: true,
  },
  {
    id: 5,
    name: "Espresso",
    price: 50,
    category: "coffee",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1o0_rDypRGl4gYiwQ2n_2SqQ8ZotkyFfiPznY1-07Sw&s=10",
    description: "Pure, bold shot of coffee",
    available: true,
  },
  {
    id: 6,
    name: "Chocolate Shake",
    price: 120,
    category: "shakes",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeCtv-8WgzjQQwNWoYBhxfnwbz5amv_MgVUlFstfdWQw&s=10",
    description: "Thick shake loaded with chocolate",
    available: true,
  },
  {
    id: 7,
    name: "Veg Sandwich",
    price: 90,
    category: "snacks",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnIDISouZCo7vMTwTehutVQrAqt3p3y_dAlB-RYUMJyw&s=10",
    description: "Grilled sandwich with fresh vegetables",
    available: true,
  },
  {
    id: 8,
    name: "Cheese Burger",
    price: 110,
    category: "snacks",
    image: "https://www.noracooks.com/wp-content/uploads/2023/04/veggie-burgers-1-2.jpg",
    description: "Juicy patty with melted cheese",
    available: true,
  },
];
