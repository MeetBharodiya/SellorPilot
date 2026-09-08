import { CategoryKey } from "@/lib/categories/config";
import { buildNailsPrompt } from "./nails";
import { buildSareePrompt } from "./sarees";

/**
 * Prompt router — returns the correct LLM prompt for the given category.
 * To add a new category: create a new prompt file and add a case here.
 */
export function getPromptForCategory(
  category: CategoryKey,
  sellerDescription?: string
): string {
  switch (category) {
    case "press_on_nails":
      return buildNailsPrompt(sellerDescription);

    case "sarees":
      return buildSareePrompt(sellerDescription ?? "");

    default:
      return buildNailsPrompt(sellerDescription);
  }
}
