import React, { useState } from 'react';

const App = () => {
  // State for the main food category selected by the user.
  const [selectedCategory, setSelectedCategory] = useState(null);
  // State for the specific sub-category selected by the user.
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  // State to hold the final search results (restaurant links).
  const [results, setResults] = useState([]);

  // The new, two-layer data structure.
  // The top-level keys are broad categories.
  // The nested objects contain more specific sub-categories and their associated restaurant links.
  const foodDatabase = {
    'Fried Chicken': {
      'Spicy Chicken Sandwich': [
        { name: 'Popeyes Spicy Chicken Sandwich', url: 'https://www.popeyes.com/spicy-chicken-sandwich' },
        { name: 'KFC Spicy Famous Bowl', url: 'https://www.kfc.com/menu/bowls/spicy-famous-bowl' },
        { name: 'Chick-fil-A Spicy Deluxe Sandwich', url: 'https://www.chick-fil-a.com/spicy-deluxe-sandwich' },
      ],
      'Combo Meal': [
        { name: 'KFC 8 pc. Meal', url: 'https://www.kfc.com/menu/big-box-meals/8-pc-meal' },
        { name: 'Raising Cane\'s Box Combo', url: 'https://www.raisingcanes.com/menu' },
        { name: 'Popeyes Family Meal', url: 'https://www.popeyes.com/family-meals' },
      ],
    },
    'Burgers': {
      'Two-Layer Burger': [
        { name: 'McDonald\'s Big Mac', url: 'https://www.mcdonalds.com/us/en-us/product/big-mac' },
        { name: 'Burger King Big King', url: 'https://www.bk.com/menu-items/big-king' },
        { name: 'Wendy\'s Big Bacon Cheddar Cheeseburger', url: 'https://www.wendys.com/big-bacon-cheddar-cheeseburger' },
      ],
      'Classic Burger': [
        { name: 'McDonald\'s Quarter Pounder', url: 'https://www.mcdonalds.com/us/en-us/product/quarter-pounder-with-cheese' },
        { name: 'Five Guys Hamburger', url: 'https://www.fiveguys.com/menu/burgers' },
      ],
    },
    'Healthy & Salad': {
      'Salad': [
        { name: 'Sweetgreen Salads', url: 'https://www.sweetgreen.com/menu/salads' },
        { name: 'Chipotle Salad Bowls', url: 'https://www.chipotle.com/menu/salads' },
        { name: 'Panera Bread Salads', url: 'https://www.panerabread.com/menu/salads' },
      ],
      'Healthy Bowl': [
        { name: 'Sweetgreen Warm Bowls', url: 'https://www.sweetgreen.com/menu/warm-bowls' },
        { name: 'Chipotle Burrito Bowls', url: 'https://www.chipotle.com/menu/burrito-bowls' },
      ],
    },
  };

  // Function to handle the top-level category button click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // Reset the subcategory and results when a new category is selected
    setSelectedSubcategory(null);
    setResults([]);
  };

  // Function to handle the specific sub-category button click
  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
    // Get the results from the nested data structure
    setResults(foodDatabase[selectedCategory][subcategory]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 font-sans text-gray-800">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-6 tracking-tight">
          Food Finder
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Find what you're craving in two easy steps.
        </p>

        {/* Step 1: Select a main category */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Step 1: Choose a main food type</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.keys(foodDatabase).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-6 py-3 font-semibold rounded-full shadow-md transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select a specific option (only visible after Step 1) */}
        {selectedCategory && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Step 2: Be more specific</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.keys(foodDatabase[selectedCategory]).map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className={`px-6 py-3 font-semibold rounded-full shadow-md transition-all duration-300 transform hover:scale-105 ${
                    selectedSubcategory === subcategory
                      ? 'bg-green-500 text-white ring-2 ring-green-400 ring-offset-2'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results section (only visible after Step 2) */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 text-center">Explore your options:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {results.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50"
                >
                  <h3 className="text-xl font-semibold text-blue-600">{item.name}</h3>
                  <p className="text-sm text-gray-500 truncate mt-1">{item.url}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
