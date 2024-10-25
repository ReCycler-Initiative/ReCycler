import { getMaterials } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon, Paperclip, RecycleIcon } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import LoadingSpinner from "./loading-spinner";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const CustomCheckbox = ({ label, name }: { label: string; name: string }) => {
  const { register, watch } = useFormContext();
  const checked: boolean = watch(name);

  return (
    <div className="relative">
      <label
        data-checked={checked}
        className="border flex-col border-gray-700 py-2 px-2 justify-center text-center aspect-square flex items-center bg-white rounded-sm data-[checked=true]:bg-gray-700 data-[checked=true]:text-white"
      >
        <RecycleIcon className="mb-3 text-red-600" />
        <input
          {...register(name)}
          checked={checked || false}
          className="hidden"
          type="checkbox"
        />
        <span className="checkbox-mark"></span>
        <span className="text-sm">{label}</span>
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="text-gray-600 absolute bottom-[1px] right-[1px]"
            size="icon"
            variant="ghost"
          >
            <InfoIcon className="text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="text-sm">
          <h4 className="mb-4 font-bold text-base">Lamput</h4>
          <p className="text-green-600">Kyllä</p>
          <ul className="list-disc py-2 px-4 mb-2">
            <li>Energiansäästölamput</li>
            <li>Loisteputket</li>
          </ul>
          <p className="text-red-600">Ei</p>
          <ul className="list-disc py-2 px-4">
            <li>halogeenilamput (kodin jäteastiaan)</li>
            <li>hehkulamput (kodin jäteastiaan)</li>
            <li>autojen lamput (kodin jäteastiaan)</li>
          </ul>

          <span className="block mt-4 underline text-right">Lue lisää</span>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const Materials = () => {
  const { data: materials, isFetching } = useQuery({
    queryKey: ["materials"],
    queryFn: getMaterials,
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
