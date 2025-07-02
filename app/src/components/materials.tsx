import { getMaterials } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { RecycleIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { useFormContext } from "react-hook-form";
import CarBattery from "./icons/CarBattery";
import CardBoard from "./icons/CardBoard";
import Carton from "./icons/Carton";
import Construction from "./icons/Building";
import Dangerous from "./icons/Dangerous";
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
import ElectricWaste from "./icons/ElectricWaste";
import BioWaste from "./icons/BioWaste";
import { cn } from "@/utils/shadcn";

const iconMap: { code: number; color: string; name?: string; icon?: ReactNode }[] = [
  { code: 115, color: "bg-[#d9001e]", icon: <CarBattery /> },
  { code: 102, color: "bg-[#000000]", icon: <EnergyWaste /> }, // musta
  { code: 110, color: "bg-[#d9001e]", icon: <SmallBattery /> },
  { code: 105, icon: <Carton /> },
  { code: 118, icon: <Wood /> },
  { code: 116, icon: <Lamp /> },
  { code: 107, icon: <Glass /> },
  { code: 106, icon: <Metal /> },
  { code: 111, icon: <Plastic /> },
  { code: 114, icon: <WasteBin /> },
  { code: 104, icon: <CardBoard /> },
  { code: 103, icon: <Paper /> },
  { code: 120, icon: <Textile /> },
  { code: 117, icon: <Wood /> },
  { code: 101, icon: <Garden /> },
  { code: 119, icon: <Construction /> },
  { code: 109, icon: <ElectricWaste /> },
  { code: 100, color: "bg-[#000000]", icon: <WasteBin /> },
  { code: 113, icon: <TextileReuse /> },
  { code: 112, color: "bg-[#139339]", icon: <BioWaste /> },
  { code: 108, icon: <Dangerous /> },
];

const CustomCheckbox = ({
  color,
  icon,
  label,
  name,
}: {
  color?: string;
  icon?: ReactNode;
  label: string;
  name: string;
}) => {
  const { register, watch } = useFormContext();
  const checked: boolean = watch(name);

  return (
<label
  className={cn(
    "box-border border-4 flex-col py-2 px-2 pt-[35%] sm:pt-[40%] md:pt-11 text-center aspect-square flex items-center rounded-sm text-white transition-all duration-200",
    color,
    checked ? "border-[#FFD700]" : "border-black-400"
  )}
>
      {icon ? (
        <div className="mb-3">{icon}</div>
      ) : (
        <RecycleIcon className="mb-3 text-red-600" />
      )}
      <input
        {...register(name)}
        checked={checked || false}
        className="hidden"
        type="checkbox"
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
        res.map((m) => ({
          ...m,
          color: iconMap.find((i) => i.code === m.code)?.color,
          icon: iconMap.find((i) => i.code === m.code)?.icon,
        }))
      ),
    staleTime: Infinity,
  });

  const [showMore, setShowMore] = useState(false);

  if (isFetching) {
    return (
      <div className="flex items-center flex-col gap-4 py-6">
        <LoadingSpinner />
        <p>Haetaan materiaaleja...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {materials?.map((material) => (
          <CustomCheckbox
            key={material.code}
            color={material.color}
            label={material.name}
            name={`materials.${material.code}`}
            icon={material.icon}
          />
        ))}
      </div>
    </>
  );
};
