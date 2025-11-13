const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';

const generateBtn = document.getElementById('generateBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const mealCard = document.getElementById('mealCard');

const mealImage = document.getElementById('mealImage');
const mealName = document.getElementById('mealName');
const mealCategory = document.getElementById('mealCategory');
const mealArea = document.getElementById('mealArea');
const mealInstructions = document.getElementById('mealInstructions');
const ingredientsList = document.getElementById('ingredientsList');

async function fetchRandomMeal() {
    try {
        showLoading();
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch meal data');
        }
        
        const data = await response.json();
        
        displayMeal(data.meals[0]);
        
    } catch (error) {
        console.error('Error fetching meal:', error);
        showError();
    }
}

function displayMeal(meal) {
    loadingSpinner.classList.add('hidden');
    
    mealName.textContent = meal.strMeal;
    mealImage.src = meal.strMealThumb;
    mealImage.alt = meal.strMeal;
    mealCategory.textContent = meal.strCategory;
    mealArea.textContent = `🌍 ${meal.strArea} Cuisine`;
    mealInstructions.textContent = meal.strInstructions;
    
    ingredientsList.innerHTML = '';
    
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== '') {
            const li = document.createElement('li');
            li.textContent = `${measure} ${ingredient}`;
            ingredientsList.appendChild(li);
        }
    }
    
    mealCard.classList.remove('hidden');
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    mealCard.classList.add('hidden');
}

function showError() {
    loadingSpinner.classList.add('hidden');
    mealCard.classList.add('hidden');
}

generateBtn.addEventListener('click', fetchRandomMeal);