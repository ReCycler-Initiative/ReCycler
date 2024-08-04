import { getMaterials } from "@/services/api";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

const CustomCheckbox = ({ label, name }: { label: string; name: string }) => {
  const { register, watch } = useFormContext();
  const checked: boolean = watch(name);

  return (
    <label
      data-checked={checked}
      className="border border-gray-700 py-2 px-2 text-center h-16 flex justify-center items-center bg-white rounded-sm data-[checked=true]:bg-gray-700 data-[checked=true]:text-white"
    >
      <input
        {...register(name)}
        checked={checked || false}
        className="hidden"
        type="checkbox"
      />
      <span className="checkbox-mark"></span>
      {label}
    </label>
  );
};

export const Materials = () => {
  const { data: materials } = useQuery({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });

  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-8">
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
