import { useLocale, useMessages } from "@/i18n/locale-provider";
import { normalizeMaterialText } from "@/lib/material-translations";
import { getMaterials } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon, RecycleIcon } from "lucide-react";
import { ReactNode, useState } from "react";
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
import MarkdownBlock from "./markdown-block";
import { Dialog, DialogContent } from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

// HEX → rgba
export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return "transparent";
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

type MaterialSelection = {
  contentFi: ReactNode;
  contentEn: ReactNode;
  code: number;
  baseHex?: string;
  icon?: ReactNode;
};

export const iconMap: MaterialSelection[] = [
  {
    code: 115,
    baseHex: "#d9001e",
    icon: <CarBattery />,
    contentFi: <MarkdownBlock filePath="Ajoneuvoakut(lyijy).md" />,
    contentEn: <MarkdownBlock filePath="Ajoneuvoakut(lyijy)_en.md" />,
  },
  {
    code: 102,
    baseHex: "#000000",
    icon: <EnergyWaste />,
    contentFi: <MarkdownBlock filePath="energiajäte.md" />,
    contentEn: <MarkdownBlock filePath="energiajäte_en.md" />,
  },
  {
    code: 110,
    baseHex: "#d9001e",
    icon: <SmallBattery />,
    contentFi: <MarkdownBlock filePath="Paristot-ja-pienakut.md" />,
    contentEn: <MarkdownBlock filePath="Paristot-ja-pienakut_en.md" />,
  },
  {
    code: 105,
    baseHex: "#176eb1",
    icon: <Carton />,
    contentFi: <MarkdownBlock filePath="kartonki.md" />,
    contentEn: <MarkdownBlock filePath="kartonki_en.md" />,
  },
  {
    code: 118,
    baseHex: "#d9001e",
    icon: <Wood />,
    contentFi: <MarkdownBlock filePath="kyllästetty-puu.md" />,
    contentEn: <MarkdownBlock filePath="kyllästetty-puu_en.md" />,
  },
  {
    code: 116,
    baseHex: "#d9001e",
    icon: <Lamp />,
    contentFi: <MarkdownBlock filePath="lamput.md" />,
    contentEn: <MarkdownBlock filePath="lamput_en.md" />,
  },
  {
    code: 107,
    baseHex: "#21a07b",
    icon: <Glass />,
    contentFi: <MarkdownBlock filePath="lasi.md" />,
    contentEn: <MarkdownBlock filePath="lasi_en.md" />,
  },
  {
    code: 106,
    baseHex: "#485b66",
    icon: <Metal />,
    contentFi: <MarkdownBlock filePath="metalli.md" />,
    contentEn: <MarkdownBlock filePath="metalli_en.md" />,
  },
  {
    code: 111,
    baseHex: "#820f71",
    icon: <Plastic />,
    contentFi: <MarkdownBlock filePath="muovi.md" />,
    contentEn: <MarkdownBlock filePath="muovi_en.md" />,
  },
  {
    code: 109,
    baseHex: "#d9001e",
    icon: <ElectricWaste />,
    contentFi: <MarkdownBlock filePath="Sähkölaitteet(SER).md" />,
    contentEn: <MarkdownBlock filePath="Sähkölaitteet(SER)_en.md" />,
  },
  {
    code: 100,
    baseHex: "#000000",
    icon: <WasteBin />,
    contentFi: <MarkdownBlock filePath="sekajäte.md" />,
    contentEn: <MarkdownBlock filePath="sekajäte_en.md" />,
  },
  {
    code: 112,
    baseHex: "#139339",
    icon: <BioWaste />,
    contentFi: <MarkdownBlock filePath="biojäte.md" />,
    contentEn: <MarkdownBlock filePath="biojäte_en.md" />,
  },
  {
    code: 114,
    baseHex: "#000000",
    icon: <WasteBin />,
    contentFi: <MarkdownBlock filePath="muujäte.md" />,
    contentEn: <MarkdownBlock filePath="muujäte_en.md" />,
  },
  {
    code: 104,
    baseHex: "#176eb1",
    icon: <CardBoard />,
    contentFi: <MarkdownBlock filePath="pahvi.md" />,
    contentEn: <MarkdownBlock filePath="pahvi_en.md" />,
  },
  {
    code: 103,
    baseHex: "#176eb1",
    icon: <Paper />,
    contentFi: <MarkdownBlock filePath="paperi.md" />,
    contentEn: <MarkdownBlock filePath="paperi_en.md" />,
  },
  {
    code: 120,
    baseHex: "#6b9030",
    icon: <Textile />,
    contentFi: <MarkdownBlock filePath="poistotekstiili.md" />,
    contentEn: <MarkdownBlock filePath="poistotekstiili_en.md" />,
  },
  {
    code: 117,
    baseHex: "#d9001e",
    icon: <Wood />,
    contentFi: <MarkdownBlock filePath="puu.md" />,
    contentEn: <MarkdownBlock filePath="puu_en.md" />,
  },
  {
    code: 101,
    baseHex: "#139339",
    icon: <Garden />,
    contentFi: <MarkdownBlock filePath="puutarhajäte.md" />,
    contentEn: <MarkdownBlock filePath="puutarhajäte_en.md" />,
  },
  {
    code: 119,
    baseHex: "#0c3a6f",
    icon: <Construction />,
    contentFi: <MarkdownBlock filePath="rakennus-ja-purkujäte.md" />,
    contentEn: <MarkdownBlock filePath="rakennus-ja-purkujäte_en.md" />,
  },
  {
    code: 113,
    baseHex: "#6b9030",
    icon: <TextileReuse />,
    contentFi: <MarkdownBlock filePath="tekstiili.md" />,
    contentEn: <MarkdownBlock filePath="tekstiili_en.md" />,
  },
  {
    code: 108,
    baseHex: "#d9001e",
    icon: <Dangerous />,
    contentFi: <MarkdownBlock filePath="vaarallinenjäte.md" />,
    contentEn: <MarkdownBlock filePath="vaarallinenjäte_en.md" />,
  },
];

// Name-based icon lookup for use with field string values.
const rawNameIconMap: Record<string, { baseHex: string; icon: ReactNode }> = {
  ajoneuvoakut: { baseHex: "#d9001e", icon: <CarBattery /> },
  "ajoneuvoakut (lyijy)": { baseHex: "#d9001e", icon: <CarBattery /> },
  "ajoneuvoakku (lyijy)": { baseHex: "#d9001e", icon: <CarBattery /> },
  "vehicle batteries (lead-acid)": { baseHex: "#d9001e", icon: <CarBattery /> },
  "vehicle battery (lead-acid)": { baseHex: "#d9001e", icon: <CarBattery /> },
  energiajäte: { baseHex: "#000000", icon: <EnergyWaste /> },
  "energy waste": { baseHex: "#000000", icon: <EnergyWaste /> },
  "kannettavat akut ja paristot": {
    baseHex: "#d9001e",
    icon: <SmallBattery />,
  },
  "portable batteries": { baseHex: "#d9001e", icon: <SmallBattery /> },
  kartonki: { baseHex: "#176eb1", icon: <Carton /> },
  carton: { baseHex: "#176eb1", icon: <Carton /> },
  "kyllästetty puu": { baseHex: "#d9001e", icon: <Wood /> },
  "pressure-treated wood": { baseHex: "#d9001e", icon: <Wood /> },
  lamput: { baseHex: "#d9001e", icon: <Lamp /> },
  lamps: { baseHex: "#d9001e", icon: <Lamp /> },
  lasi: { baseHex: "#21a07b", icon: <Glass /> },
  glass: { baseHex: "#21a07b", icon: <Glass /> },
  metalli: { baseHex: "#485b66", icon: <Metal /> },
  metal: { baseHex: "#485b66", icon: <Metal /> },
  muovi: { baseHex: "#820f71", icon: <Plastic /> },
  plastic: { baseHex: "#820f71", icon: <Plastic /> },
  "sähkölaitteet (ser)": { baseHex: "#d9001e", icon: <ElectricWaste /> },
  "electronics (weee)": { baseHex: "#d9001e", icon: <ElectricWaste /> },
  sekajäte: { baseHex: "#000000", icon: <WasteBin /> },
  "mixed waste": { baseHex: "#000000", icon: <WasteBin /> },
  biojäte: { baseHex: "#139339", icon: <BioWaste /> },
  biowaste: { baseHex: "#139339", icon: <BioWaste /> },
  "muu jäte": { baseHex: "#000000", icon: <WasteBin /> },
  "other waste": { baseHex: "#000000", icon: <WasteBin /> },
  pahvi: { baseHex: "#176eb1", icon: <CardBoard /> },
  cardboard: { baseHex: "#176eb1", icon: <CardBoard /> },
  paperi: { baseHex: "#176eb1", icon: <Paper /> },
  paper: { baseHex: "#176eb1", icon: <Paper /> },
  tekstiili: { baseHex: "#6b9030", icon: <Textile /> },
  textile: { baseHex: "#6b9030", icon: <Textile /> },
  puu: { baseHex: "#d9001e", icon: <Wood /> },
  wood: { baseHex: "#d9001e", icon: <Wood /> },
  puutarhajäte: { baseHex: "#139339", icon: <Garden /> },
  "garden waste": { baseHex: "#139339", icon: <Garden /> },
  "rakennus- ja purkujäte": { baseHex: "#0c3a6f", icon: <Construction /> },
  "construction waste": { baseHex: "#0c3a6f", icon: <Construction /> },
  poistotekstiili: { baseHex: "#6b9030", icon: <TextileReuse /> },
  "discarded textile": { baseHex: "#6b9030", icon: <TextileReuse /> },
  "vaarallinen jäte": { baseHex: "#d9001e", icon: <Dangerous /> },
  "hazardous waste": { baseHex: "#d9001e", icon: <Dangerous /> },
};

export const nameIconMap: Record<string, { baseHex: string; icon: ReactNode }> =
  Object.fromEntries(
    Object.entries(rawNameIconMap).map(([name, entry]) => [
      normalizeMaterialText(name),
      entry,
    ])
  );

export const getNameIconEntry = (name: string) =>
  nameIconMap[normalizeMaterialText(name)];

export const CustomCheckbox = ({
  baseHex,
  checked,
  icon,
  label,
  onInfo,
  onToggle,
}: {
  baseHex?: string;
  checked: boolean;
  icon?: ReactNode;
  label: string;
  onInfo: () => void;
  onToggle: () => void;
}) => {
  const backgroundColor = baseHex
    ? hexToRgba(baseHex, checked ? 1 : 0.85)
    : "transparent";

  const boxShadow = checked ? `inset 0 0 0 4px #FFD700` : undefined; // ei reunusta kun ei valittu

  return (
    <div className="relative">
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
          checked={checked}
          onChange={onToggle}
          type="checkbox"
          className="hidden"
        />
        <span className="text-sm">{label}</span>
      </label>
      <button
        className="absolute top-0 right-0 p-1.5 text-gray-200 hover:text-gray-300 cursor-pointer active:bg-black/10 rounded-r"
        onClick={onInfo}
      >
        <InfoIcon size="20" />
      </button>
    </div>
  );
};

export const Materials = ({
  selectedCodes,
  onSelectionChange,
}: {
  selectedCodes: number[];
  onSelectionChange: (codes: number[]) => void;
}) => {
  const { locale } = useLocale();
  const messages = useMessages();
  const [materialForInfo, setMaterialForInfo] = useState<MaterialSelection>();
  const { data: materials, isFetching } = useQuery({
    queryKey: ["materials", locale],
    queryFn: () => getMaterials(locale),
    staleTime: Infinity,
  });

  if (isFetching) {
    return (
      <div className="flex items-center flex-col gap-4 py-6">
        <LoadingSpinner />
        <p>{messages.materials.loadingMaterials}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {materials?.map((m) => {
        const match = iconMap.find((i) => i.code === m.code);
        const checked = selectedCodes.includes(m.code);
        return (
          <CustomCheckbox
            key={m.code}
            baseHex={match?.baseHex}
            checked={checked}
            label={m.name}
            icon={match?.icon}
            onInfo={() => setMaterialForInfo(match)}
            onToggle={() => {
              onSelectionChange(
                checked
                  ? selectedCodes.filter((code) => code !== m.code)
                  : [...selectedCodes, m.code]
              );
            }}
          />
        );
      })}
      <Dialog
        open={!!materialForInfo}
        onOpenChange={() => setMaterialForInfo(undefined)}
      >
        <DialogContent className="max-w-3xl px-0">
          <DialogTitle className="sr-only">
            {messages.materials.loadingMaterials}
          </DialogTitle>
          <div className="h-[800px] max-h-[80vh] overflow-y-auto px-4 lg:px-6">
            <div className="mb-6">{materialForInfo?.icon}</div>
            {locale === "fi"
              ? materialForInfo?.contentFi
              : materialForInfo?.contentEn}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
