import { Locale } from "@/i18n/messages";
import { Material } from "@/types";

const materialNameTranslations: Record<number, { fi: string; en: string }> = {
  100: { fi: "Sekajäte", en: "Mixed waste" },
  101: { fi: "Puutarhajäte", en: "Garden waste" },
  102: { fi: "Energiajäte", en: "Energy waste" },
  103: { fi: "Paperi", en: "Paper" },
  104: { fi: "Pahvi", en: "Cardboard" },
  105: { fi: "Kartonki", en: "Carton" },
  106: { fi: "Metalli", en: "Metal" },
  107: { fi: "Lasi", en: "Glass" },
  108: { fi: "Vaarallinen jäte", en: "Hazardous waste" },
  109: { fi: "Sähkölaitteet (SER)", en: "Electronics (WEEE)" },
  110: { fi: "Kannettavat akut ja paristot", en: "Portable batteries" },
  111: { fi: "Muovi", en: "Plastic" },
  112: { fi: "Biojäte", en: "Biowaste" },
  113: { fi: "Tekstiili", en: "Textile" },
  114: { fi: "Muu jäte", en: "Other waste" },
  115: { fi: "Ajoneuvoakut (lyijy)", en: "Vehicle batteries (lead-acid)" },
  116: { fi: "Lamput", en: "Lamps" },
  117: { fi: "Puu", en: "Wood" },
  118: { fi: "Kyllästetty puu", en: "Pressure-treated wood" },
  119: { fi: "Rakennus- ja purkujäte", en: "Construction waste" },
  120: { fi: "Poistotekstiili", en: "Discarded textile" },
};

export const normalizeMaterialText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

export const getLocalizedMaterialName = (
  material: Pick<Material, "code" | "name">,
  locale: Locale
) => {
  const translation = materialNameTranslations[material.code];
  if (!translation) {
    return material.name;
  }

  return translation[locale] || translation.fi || material.name;
};

export const localizeMaterials = <T extends Pick<Material, "code" | "name">>(
  materials: T[],
  locale: Locale
): T[] =>
  materials.map((material) => ({
    ...material,
    name: getLocalizedMaterialName(material, locale),
  }));

export const materialNameMatches = (
  material: Pick<Material, "code" | "name">,
  candidate: string
) => {
  const normalizedCandidate = normalizeMaterialText(candidate);
  const translation = materialNameTranslations[material.code];

  if (normalizeMaterialText(material.name) === normalizedCandidate) {
    return true;
  }

  if (!translation) {
    return false;
  }

  return [translation.fi, translation.en].some(
    (name) => normalizeMaterialText(name) === normalizedCandidate
  );
};

export const localizeMaterialNameCandidate = (
  candidate: string,
  locale: Locale
) => {
  const normalizedCandidate = normalizeMaterialText(candidate);

  for (const translation of Object.values(materialNameTranslations)) {
    if (
      [translation.fi, translation.en].some(
        (name) => normalizeMaterialText(name) === normalizedCandidate
      )
    ) {
      return translation[locale] || translation.fi || candidate;
    }
  }

  return candidate;
};