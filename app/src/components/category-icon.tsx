import {
  Accessibility, Battery, Bike, Building2, Car, Coffee, Droplets, Flame,
  Heart, Hospital, House, Landmark, Leaf, MapPin, Package, ParkingCircle,
  Recycle, ShoppingBag, Toilet, Trash2, Trees, Utensils, Wrench, Zap,
} from "lucide-react";

export const CATEGORY_ICONS = [
  { id: "map-pin", icon: MapPin, fi: "Sijainti", en: "Location" },
  { id: "recycle", icon: Recycle, fi: "Kierr\u00e4tys", en: "Recycling" },
  { id: "trash", icon: Trash2, fi: "J\u00e4te", en: "Waste" },
  { id: "leaf", icon: Leaf, fi: "Lehti", en: "Leaf" },
  { id: "trees", icon: Trees, fi: "Puisto", en: "Park" },
  { id: "package", icon: Package, fi: "Paketti", en: "Package" },
  { id: "battery", icon: Battery, fi: "Akku", en: "Battery" },
  { id: "zap", icon: Zap, fi: "S\u00e4hk\u00f6", en: "Electricity" },
  { id: "flame", icon: Flame, fi: "Energia", en: "Energy" },
  { id: "droplets", icon: Droplets, fi: "Vesi", en: "Water" },
  { id: "car", icon: Car, fi: "Auto", en: "Car" },
  { id: "bike", icon: Bike, fi: "Py\u00f6r\u00e4", en: "Bicycle" },
  { id: "parking", icon: ParkingCircle, fi: "Pys\u00e4k\u00f6inti", en: "Parking" },
  { id: "accessibility", icon: Accessibility, fi: "Esteett\u00f6myys", en: "Accessibility" },
  { id: "building", icon: Building2, fi: "Rakennus", en: "Building" },
  { id: "house", icon: House, fi: "Koti", en: "Home" },
  { id: "landmark", icon: Landmark, fi: "N\u00e4ht\u00e4vyys", en: "Landmark" },
  { id: "coffee", icon: Coffee, fi: "Kahvila", en: "Cafe" },
  { id: "utensils", icon: Utensils, fi: "Ruoka", en: "Food" },
  { id: "shopping", icon: ShoppingBag, fi: "Kauppa", en: "Shop" },
  { id: "hospital", icon: Hospital, fi: "Terveyspalvelu", en: "Healthcare" },
  { id: "heart", icon: Heart, fi: "Hyvinvointi", en: "Wellbeing" },
  { id: "toilet", icon: Toilet, fi: "WC", en: "Toilet" },
  { id: "wrench", icon: Wrench, fi: "Huolto", en: "Maintenance" },
] as const;

export const getCategoryIcon = (id: string | undefined) => {
  const entry = CATEGORY_ICONS.find((item) => item.id === id);
  if (!entry) return undefined;
  const Icon = entry.icon;
  return <Icon className="h-6 w-6" />;
};