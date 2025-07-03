import { getMaterials } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { RecycleIcon } from "lucide-react";
import { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import BioWaste from "./icons/BioWaste";
import Construction from "./icons/Building";
import CarBattery from "./icons/CarBattery";
import CardBoard from "./icons/CardBoard";
import Carton from "./icons/Carton";
import Dangerous from "./icons/Dangerous";
import ElectricWaste from "./icons/ElectricWaste";
import EnergyWaste from "./icons/EnergyWaste";
import Garden from "./icons/Garden";
import Glass from "./icons/Glass";
import Lamp from "./icons/Lamp";
import Metal from "./icons/Metal";
import Paper from "./icons/Paper";
import Plastic from "./icons/Plastic";
import SmallBattery from "./icons/SmallBattery";
import Textile from "./icons/Textile";
import TextileReuse from "./icons/TextileReuse";
import WasteBin from "./icons/WasteBin";
import Wood from "./icons/Wood";
import LoadingSpinner from "./loading-spinner";

// HEX → rgba
const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return "transparent";
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const iconMap: {
  code: number;
  baseHex?: string;
  icon?: ReactNode;
}[] = [
  { code: 115, baseHex: "#d9001e", icon: <CarBattery /> },
  { code: 102, baseHex: "#000000", icon: <EnergyWaste /> },
  { code: 110, baseHex: "#d9001e", icon: <SmallBattery /> },
  { code: 105, baseHex: "#176eb1", icon: <Carton /> },
  { code: 118, baseHex: "#d9001e", icon: <Wood /> },
  { code: 116, baseHex: "#d9001e", icon: <Lamp /> },
  { code: 107, baseHex: "#21a07b", icon: <Glass /> },
  { code: 106, baseHex: "#485b66", icon: <Metal /> },
  { code: 111, baseHex: "#820f71", icon: <Plastic /> },
  { code: 109, baseHex: "#d9001e", icon: <ElectricWaste /> },
  { code: 100, baseHex: "#000000", icon: <WasteBin /> },
  { code: 112, baseHex: "#139339", icon: <BioWaste /> },
  { code: 114, baseHex: "#000000", icon: <WasteBin /> },
  { code: 104, baseHex: "#176eb1", icon: <CardBoard /> },
  { code: 103, baseHex: "#176eb1", icon: <Paper /> },
  { code: 120, baseHex: "#6b9030", icon: <Textile /> },
  { code: 117, baseHex: "#d9001e", icon: <Wood /> },
  { code: 101, baseHex: "#139339", icon: <Garden /> },
  { code: 119, baseHex: "#0c3a6f", icon: <Construction /> },
  { code: 113, baseHex: "#6b9030", icon: <TextileReuse /> },
  { code: 108, baseHex: "#d9001e", icon: <Dangerous /> },
];

const CustomCheckbox = ({
  baseHex,
  icon,
  label,
  name,
}: {
  baseHex?: string;
  icon?: ReactNode;
  label: string;
  name: string;
}) => {
  const { register } = useFormContext();
  const checked: boolean = useWatch({ name });

  const backgroundColor = baseHex
    ? hexToRgba(baseHex, checked ? 1 : 0.85)
    : "transparent";

  const boxShadow = checked ? `inset 0 0 0 4px #FFD700` : undefined; // ei reunusta kun ei valittu

  return (
    <label
      className="flex aspect-square flex-col items-center justify-center rounded-sm px-2 py-2 text-center text-white"
      style={{
        backgroundColor,
        boxShadow,
      }}
    >
      <div className="mb-2 transform scale-125">
        {icon ?? <RecycleIcon className="text-red-600" />}
      </div>
      <input
        {...register(name)}
        checked={checked || false}
        type="checkbox"
        className="hidden"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
};

export const Materials = () => {
  const { data: materials, isFetching } = useQuery({
    queryKey: ["materials"],
    queryFn: () =>
      getMaterials().then((res) =>
        res.map((m) => {
          const match = iconMap.find((i) => i.code === m.code);
          return {
            ...m,
            baseHex: match?.baseHex,
            icon: match?.icon,
          };
        })
      ),
    staleTime: Infinity,
  });

  if (isFetching) {
    return (
      <div className="flex items-center flex-col gap-4 py-6">
        <LoadingSpinner />
        <p>Haetaan materiaaleja...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {materials?.map((material) => (
        <CustomCheckbox
          key={material.code}
          baseHex={material.baseHex}
          label={material.name}
          name={`materials.${material.code}`}
          icon={material.icon}
        />
      ))}
    </div>
  );
};
