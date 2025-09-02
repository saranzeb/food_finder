import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, getDocs } from 'firebase/firestore';

// --- Global Firebase and API Configuration ---
// The __app_id is provided by the environment.
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const appId = rawAppId.split('/')[0];

// FOR DEPLOYMENT: Replace the placeholder values below with your own Firebase config.
// You can find this in your Firebase project settings under "Project settings" > "Your apps".
//const firebaseConfig = {
  //apiKey: "YOUR_API_KEY",
  //authDomain: "YOUR_AUTH_DOMAIN",
  //projectId: "YOUR_PROJECT_ID",
  //storageBucket: "YOUR_STORAGE_BUCKET",
  //messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  //appId: "YOUR_APP_ID",
//};


const firebaseConfig = {
  apiKey: "AIzaSyCcKyulzpjHfDfWdS_9x6eQxq4v9pweqbs",
  authDomain: "food-47696.firebaseapp.com",
  projectId: "food-47696",
  storageBucket: "food-47696.firebasestorage.app",
  messagingSenderId: "234381908469",
  appId: "1:234381908469:web:42b73cddf81194d860e8bc",
  measurementId: "G-VSGFWQT671"
};


// For API calls, provide your API key below.
const apiKey = "";

// --- Firebase and API Helper Functions ---
const initializeFirebase = () => {
  return new Promise((resolve, reject) => {
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const auth = getAuth(app);

      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('User is signed in:', user.uid);
          resolve(db);
        } else {
          const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
          if (initialAuthToken) {
            signInWithCustomToken(auth, initialAuthToken)
              .then(() => resolve(db))
              .catch((error) => {
                console.error('Error signing in with custom token:', error);
                signInAnonymously(auth).then(() => resolve(db)).catch(reject);
              });
          } else {
            signInAnonymously(auth)
              .then(() => resolve(db))
              .catch(reject);
          }
        }
      });
    } catch (e) {
      console.error('Error initializing Firebase:', e);
      reject(e);
    }
  });
};

const getFoodData = (db, setFoodDatabase, setError) => {
  if (!db) return;
  const foodRef = collection(db, `/artifacts/${appId}/public/data/food_items`);
  const q = query(foodRef);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const data = {};
    querySnapshot.forEach((doc) => {
      const item = doc.data();
      const category = item.category;
      const subcategory = item.subcategory;

      if (!data[category]) {
        data[category] = {};
      }
      if (!data[category][subcategory]) {
        data[category][subcategory] = [];
      }
      data[category][subcategory].push({
        name: item.name,
        url: item.url
      });
    });
    setFoodDatabase(data);
    console.log("Database synced successfully.");
  }, (err) => {
    console.error("Error fetching Firestore data:", err);
    setError("Failed to fetch food data. Please check your network connection.");
  });

  return unsubscribe;
};

const addFoodData = async (db, setIsLoading, setError, setMessage) => {
  if (!db) {
    setError("Database not ready. Please refresh the page.");
    return;
  }
  setIsLoading(true);
  setError(null);
  setMessage("");

  const foodRef = collection(db, `/artifacts/${appId}/public/data/food_items`);

  const foodItemsToAdd = [
    { category: "Burgers", subcategory: "Cheeseburger", name: "In-N-Out Cheeseburger", url: "https://www.in-n-out.com/menu" },
    { category: "Burgers", subcategory: "Cheeseburger", name: "McDonald's Quarter Pounder with Cheese", url: "https://www.mcdonalds.com/us/en-us/product/quarter-pounder-with-cheese" },
    { category: "Burgers", subcategory: "Classic Burger", name: "Five Guys Hamburger", url: "https://www.fiveguys.com/menu/burgers" },
    { category: "Burgers", subcategory: "Veggie Burger", name: "Burger King Impossible Whopper", url: "https://www.bk.com/menu-items/impossible-whopper" },
    { category: "Pizza", subcategory: "Pepperoni", name: "Domino's Pepperoni Pizza", url: "https://www.dominos.com/en/pages/menu/pizza/" },
    { category: "Pizza", subcategory: "Margherita", name: "Pizza Hut Margherita", url: "https://www.pizzahut.com/c/pizza/margherita" },
    { category: "Pizza", subcategory: "Supreme", name: "Papa John's The Works", url: "https://www.papajohns.com/order/menu/pizza/the-works" },
    { category: "Pizza", subcategory: "Hawaiian", name: "Little Caesars Hawaiian Pizza", url: "https://littlecaesars.com/en-us/our-menu/pizzas/hawaiian/" },
    { category: "Tacos", subcategory: "Beef Tacos", name: "Taco Bell Crunchy Taco Supreme", url: "https://www.tacobell.com/food/tacos" },
    { category: "Tacos", subcategory: "Fish Tacos", name: "Rubio's Classic Fish Taco", url: "https://www.rubios.com/menu/classic-tacos/classic-fish-taco" },
    { category: "Tacos", subcategory: "Chicken Tacos", name: "Chipotle Chicken Tacos", url: "https://www.chipotle.com/menu/tacos" },
    { category: "Chicken", subcategory: "Fried Chicken", name: "KFC Original Recipe Chicken", url: "https://www.kfc.com/menu/chicken/original-recipe-chicken" },
    { category: "Chicken", subcategory: "Fried Chicken", name: "Popeyes Louisiana Chicken", url: "https://www.popeyes.com/menu/fried-chicken" },
    { category: "Chicken", subcategory: "Chicken Sandwich", name: "Chick-fil-A Chicken Sandwich", url: "https://www.chick-fil-a.com/menu/chick-fil-a-chicken-sandwich" },
    { category: "Salads", subcategory: "Caesar Salad", name: "Sweetgreen Caesar Salad", url: "https://www.sweetgreen.com/menu/salads/caesar-salad" },
    { category: "Salads", subcategory: "Cobb Salad", name: "Panera Bread Green Goddess Cobb Salad", url: "https://www.panerabread.com/en-us/menu/food/salads/green-goddess-cob-salad.html" },
    { category: "Desserts", subcategory: "Ice Cream", name: "Cold Stone Creamery", url: "https://www.coldstonecreamery.com/menu/icecream.html" },
    { category: "Desserts", subcategory: "Cookies", name: "Crumbl Cookies", url: "https://crumblcookies.com/menu" },
    { category: "Breakfast", subcategory: "Pancakes", name: "IHOP Buttermilk Pancakes", url: "https://www.ihop.com/en/menu/pancakes" },
    { category: "Breakfast", subcategory: "Breakfast Burrito", name: "Taco Bell Toasted Breakfast Burrito", url: "https://www.tacobell.com/food/breakfast/toasted-breakfast-burrito" },
  ];

  try {
    for (const item of foodItemsToAdd) {
      await addDoc(foodRef, item);
    }
    setMessage("Sample food data added successfully!");
  } catch (e) {
    console.error("Error adding document: ", e);
    setError("Failed to add sample data. Please check your network and Firebase permissions.");
  } finally {
    setIsLoading(false);
  }
};

const getSubcategoriesFromLLM = async (category) => {
  const userPrompt = `Generate a JSON array of 5 specific subcategories for the following food category: "${category}". The subcategories should be broad and common types of food within that category. For example, for "Mexican", you might give "Tacos" and "Burritos". Respond with a JSON array of strings, where each string is a subcategory.`;
  
  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: { "type": "STRING" }
      }
    },
    model: "gemini-2.5-flash-preview-05-20"
  };

  const maxRetries = 3;
  let retryCount = 0;
  let apiResponse;

  while (retryCount < maxRetries) {
    try {
      apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (apiResponse.ok) {
        break;
      } else {
        throw new Error(`API returned status ${apiResponse.status}`);
      }
    } catch (err) {
      retryCount++;
      if (retryCount >= maxRetries) {
        throw err;
      }
      await new Promise(res => setTimeout(res, Math.pow(2, retryCount) * 1000));
    }
  }

  const result = await apiResponse.json();
  const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!jsonText) {
    throw new Error('No subcategories could be generated.');
  }

  return JSON.parse(jsonText);
};

// --- React Component ---
const App = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [foodDatabase, setFoodDatabase] = useState({});
  const [db, setDb] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const firebaseDb = await initializeFirebase();
        setDb(firebaseDb);
        setIsDbReady(true);
      } catch (e) {
        console.error('Error initializing Firebase:', e);
        setError('Failed to initialize Firebase. Please check your configuration.');
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (db && isDbReady) {
      const unsubscribe = getFoodData(db, setFoodDatabase, setError);
      return () => unsubscribe();
    }
  }, [db, isDbReady]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setResults([]);
  };

  const handleSubcategoryClick = async (subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsLoading(true);
    setError(null);
    setMessage('');

    const manualResults = foodDatabase[selectedCategory]?.[subcategory] || [];

    if (manualResults.length > 0) {
      setResults(manualResults);
      setIsLoading(false);
      return;
    }
    
    try {
      const userPrompt = `Find popular fast-food restaurants that serve "${subcategory}" food. Provide the restaurant name and a direct link to the menu page for that specific item. Respond with a JSON array of objects, where each object has a 'name' (string) and 'url' (string). Provide at least 3, but no more than 5 results.`;
      
      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "name": { "type": "STRING" },
                "url": { "type": "STRING" }
              }
            }
          }
        },
        model: "gemini-2.5-flash-preview-05-20"
      };

      const maxRetries = 3;
      let retryCount = 0;
      let apiResponse;
      while (retryCount < maxRetries) {
        try {
          apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (apiResponse.ok) {
            break;
          } else {
            throw new Error(`API returned status ${apiResponse.status}`);
          }
        } catch (err) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw err;
          }
          await new Promise(res => setTimeout(res, Math.pow(2, retryCount) * 1000));
        }
      }

      const result = await apiResponse.json();
      const candidate = result.candidates?.[0];
      const jsonText = candidate?.content?.parts?.[0]?.text;
      
      if (!jsonText) {
        setMessage('No results found for this search. Please try another option.');
        setResults([]);
        return;
      }
      
      const parsedResults = JSON.parse(jsonText);
      setResults(parsedResults);

    } catch (e) {
      console.error('Error fetching from LLM API:', e);
      setError('Failed to get results from the search engine. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInput = async () => {
    if (!manualCategory.trim()) {
      setError("Please enter a food category.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage('');
    
    try {
        const subcategories = await getSubcategoriesFromLLM(manualCategory);
        const newDbEntry = {};
        newDbEntry[manualCategory] = {};
        
        for (const sub of subcategories) {
            newDbEntry[manualCategory][sub] = [];
        }

        setFoodDatabase(prevDb => ({
            ...prevDb,
            ...newDbEntry
        }));
        setSelectedCategory(manualCategory);
        setMessage(`Found options for "${manualCategory}". Please select a subcategory.`);
    } catch (e) {
        setError("Failed to generate options. Please try a different category or try again later.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  // --- UI Rendering with Tailwind CSS ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 font-sans text-gray-800">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-6 tracking-tight">
          Food Finder
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Find what you're craving in two easy steps.
        </p>

        {/* Button to add sample data */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => addFoodData(db, setIsLoading, setError, setMessage)}
            disabled={isLoading}
            className="px-6 py-3 font-semibold rounded-full shadow-md transition-all duration-300 transform hover:scale-105 bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding Data..." : "Initialize Database"}
          </button>
        </div>

        {/* Manual Input Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Or enter your own category:</h2>
          <div className="flex justify-center gap-4">
            <input
              type="text"
              value={manualCategory}
              onChange={(e) => setManualCategory(e.target.value)}
              placeholder="e.g., 'Desserts'"
              className="w-full max-w-sm px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleManualInput}
              disabled={isLoading || !manualCategory.trim()}
              className="px-6 py-3 font-semibold rounded-full shadow-md transition-all duration-300 transform hover:scale-105 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          </div>
        </div>

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

        {/* Loading and Error/Message Displays */}
        {isLoading && (
          <div className="text-center text-lg text-gray-600 mt-8">
            <p>Searching for options... hang tight! This may take a moment.</p>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 font-semibold mt-8">
            <p>{error}</p>
          </div>
        )}
        {!isLoading && message && (
          <div className="text-center text-gray-500 italic mt-8">
            <p>{message}</p>
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
