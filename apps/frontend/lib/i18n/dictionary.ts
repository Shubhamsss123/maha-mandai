import en from "./messages/en";
import mr from "./messages/mr";
import { Locale } from "./config";

const dictionaries = { en, mr };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
