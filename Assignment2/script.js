const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';

const generateBtn = document.getElementById('generateBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const mealCard = document.getElementById('mealCard');

async function fetchRandomMeal() {
    try {
        loadingSpinner.style.display = 'block';
        mealCard.style.display = 'none';
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch meal data');
        }
        
        const data = await response.json();
        
        displayMeal(data.meals[0]);
        
    } catch (error) {
        console.error('Error fetching meal:', error);
        loadingSpinner.style.display = 'none';
    }
}

function displayMeal(meal) {
    loadingSpinner.style.display = 'none';
    
    let ingredientsHTML = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== '') {
            ingredientsHTML += `<li>${measure} ${ingredient}</li>`;
        }
    }
    
    mealCard.innerHTML = `
        <div class="meal-image-container">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-image">
            <div class="meal-category">
                <span>${meal.strCategory}</span>
            </div>
        </div>
        
        <div class="meal-info">
            <h2 class="meal-name">${meal.strMeal}</h2>
            <div class="meal-tags">
                <span class="tag">🌍 ${meal.strArea} Cuisine</span>
            </div>
            
            <div class="instructions-section">
                <h3>📝 Instructions</h3>
                <p class="instructions-text">${meal.strInstructions}</p>
            </div>

            <div class="ingredients-section">
                <h3>🛒 Ingredients</h3>
                <ul class="ingredients-list">${ingredientsHTML}</ul>
            </div>
        </div>
    `;
    
    mealCard.style.display = 'block';
}

generateBtn.addEventListener('click', fetchRandomMeal);