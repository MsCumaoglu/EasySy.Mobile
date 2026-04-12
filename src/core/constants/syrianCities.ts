/**
 * Syrian cities static seed data.
 * This list is inserted into the `cities` table on first app install.
 * No API call needed for city search suggestions.
 */

export interface CityRecord {
  name_en: string;
  name_ar: string;
  name_tr: string;
  country_en: string;
}

export const SYRIAN_CITIES: CityRecord[] = [
  {name_en: 'Damascus', name_ar: 'دمشق', name_tr: 'Şam', country_en: 'Syria'},
  {name_en: 'Aleppo', name_ar: 'حلب', name_tr: 'Halep', country_en: 'Syria'},
  {name_en: 'Homs', name_ar: 'حمص', name_tr: 'Humus', country_en: 'Syria'},
  {name_en: 'Lattakia', name_ar: 'اللاذقية', name_tr: 'Lazkiye', country_en: 'Syria'},
  {name_en: 'Tartus', name_ar: 'طرطوس', name_tr: 'Tartus', country_en: 'Syria'},
  {name_en: 'Hama', name_ar: 'حماة', name_tr: 'Hama', country_en: 'Syria'},
  {name_en: 'Deir ez-Zor', name_ar: 'دير الزور', name_tr: 'Deyrüzzor', country_en: 'Syria'},
  {name_en: 'Raqqa', name_ar: 'الرقة', name_tr: 'Rakka', country_en: 'Syria'},
  {name_en: 'Idlib', name_ar: 'إدلب', name_tr: 'İdlib', country_en: 'Syria'},
  {name_en: 'Daraa', name_ar: 'درعا', name_tr: "Der'a", country_en: 'Syria'},
  {name_en: 'Qamishli', name_ar: 'القامشلي', name_tr: 'Kamışlı', country_en: 'Syria'},
  {name_en: 'Jableh', name_ar: 'جبلة', name_tr: 'Cebele', country_en: 'Syria'},
  {name_en: 'Baniyas', name_ar: 'بانياس', name_tr: 'Banyas', country_en: 'Syria'},
  {name_en: 'Suwayda', name_ar: 'السويداء', name_tr: 'Süveyda', country_en: 'Syria'},
  {name_en: 'Masyaf', name_ar: 'مصياف', name_tr: 'Mısyaf', country_en: 'Syria'},
];
