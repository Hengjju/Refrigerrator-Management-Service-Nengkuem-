// Ingredient data passed from the fridge screen to the recipe search panel.
export interface RecipeIngredientInput {
  id: string;
  name: string;
}

// Recipe shape normalized from the Food Safety Korea recipe API response.
export interface RecipeRecommendation {
  id: string;
  title: string;
  method: string;
  calories: string;
  imageUrl: string;
  ingredientText: string;
  ingredientKeywords: string[];
  sourceIngredients: string[];
  matchedIngredients: string[];
  missingIngredients: string[];
  manualSteps: string[];
}
