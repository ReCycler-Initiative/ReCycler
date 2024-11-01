import { getMaterials } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { RecycleIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { useFormContext } from "react-hook-form";
import CarBattery from "./icons/CarBattery";
import CardBoard from "./icons/CardBoard";
import Carton from "./icons/Carton";
import Dangerous from "./icons/Dangerous";
import EnergyWaste from "./icons/EnergyWaste";
import Garden from "./icons/Garden";
import Glass from "./icons/Glass";
import Lamp from "./icons/Lamp";
import Metal from "./icons/Metal";
import Paper from "./icons/Paper";
import Plastic from "./icons/Plastic";
import Textile from "./icons/Textile";
import TextileReuse from "./icons/TextileReuse";
import Wood from "./icons/Wood";
import WoodBeam from "./icons/WoodBeam";
import LoadingSpinner from "./loading-spinner";
import SmallBattery from "./icons/SmallBattery";

const iconMap: { code: number; name?: string; icon?: ReactNode }[] = [
  {
    code: 115,
    icon: <CarBattery />,
  },
  {
    code: 102,
    icon: <EnergyWaste />,
  },
  {
    code: 110,
    icon: <SmallBattery />,
  },
  {
    code: 105,
    icon: <Carton />,
  },
  {
    code: 118,
    icon: <WoodBeam />,
  },
  {
    code: 116,
    icon: <Lamp />,
  },
  {
    code: 107,
    icon: <Glass />,
  },
  {
    code: 106,
    icon: <Metal />,
  },
  {
    code: 111,
    icon: <Plastic />,
  },
  {
    code: 114,
    name: "Muu jäte",
  },
  {
    code: 104,
    icon: <CardBoard />,
  },
  {
    code: 103,
    icon: <Paper />,
  },
  {
    code: 120,
    icon: <Textile />,
  },
  {
    code: 117,
    icon: <Wood />,
  },
  {
    code: 101,
    icon: <Garden />,
  },
  {
    code: 119,
    name: "Rakennus- ja purkujäte",
  },
  {
    code: 109,
    name: "Sähkölaitteet (SER)",
  },
  {
    code: 100,
    name: "Sekajäte",
  },
  {
    code: 113,
    icon: <TextileReuse />,
  },
  {
    code: 108,
    icon: <Dangerous />,
  },
];

const CustomCheckbox = ({
  icon,
  label,
  name,
}: {
  icon?: ReactNode;
  label: string;
  name: string;
}) => {
  const { register, watch } = useFormContext();
  const checked: boolean = watch(name);

  return (
    <label
      data-checked={checked}
      className="border flex-col border-gray-700 py-2 px-2 justify-center text-center aspect-square flex items-center bg-white rounded-sm data-[checked=true]:bg-gray-700 data-[checked=true]:text-white"
    >
      {icon ?? <RecycleIcon className="mb-3 text-red-600" />}
      <input
        {...register(name)}
        checked={checked || false}
        className="hidden"
        type="checkbox"
      />
      <span className="checkbox-mark"></span>
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
            label={material.name}
            name={`materials.${material.code}`}
            icon={material.icon}
          />
        ))}
        {/* {showMore &&
          moreWasteTypes.map((type, i) => (
            <CustomCheckbox key={i} label={type} name={`materials.${type}`} />
          ))} */}
      </div>
      {/* <div className="flex justify-center mb-28">
        <Button
          className="flex flex-col p-4 h-auto"
          onClick={() => setShowMore(!showMore)}
          variant="ghost"
        >
          {showMore && (
            <span>
              <ChevronUpIcon />
            </span>
          )}
          {showMore
            ? "Näytä vähemmän materiaaleja"
            : "Näytä lisää materiaaleja"}
          {!showMore && (
            <span>
              <ChevronDownIcon />
            </span>
          )}
        </Button> 
      </div>*/}
    </>
  );
};
