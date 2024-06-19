import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import Container from "./container";
import { Button } from "./ui/button";

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

const wasteTypes: string[] = [
  "Energiajäte",
  "Kartonki",
  "Lamppu",
  "Lasi",
  "Muovi",
  "Paperi",
  "Pienmetalli",
  "Puu",
  "Sekajäte",
  "Tekstiili",
];

const moreWasteTypes: string[] = [
  "Ajoneuvoakut (lyijy)",
  "Kannettavat akut ja paristot",
  "Kyllästetty puu",
  "Muu jäte",
  "Poistotekstiili",
  "Puutarhajäte",
  "Rakennus- ja purkujäte",
  "Sähkölaite",
  "Vaarallinen jäte",
];

export const Materials = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {wasteTypes.map((type, i) => (
          <CustomCheckbox key={i} label={type} name={`materials.${type}`} />
        ))}
        {showMore &&
          moreWasteTypes.map((type, i) => (
            <CustomCheckbox key={i} label={type} name={`materials.${type}`} />
          ))}
      </div>
      <div className="flex justify-center mb-28">
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
          {showMore ? "Vähemmän materiaaleja" : "Lisää materiaaleja"}
          {!showMore && (
            <span>
              <ChevronDownIcon />
            </span>
          )}
        </Button>
      </div>
    </>
  );
};
