import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/widget/components/ui/select";
import { BarycentricMaterialTypes, getBarycentricMaterialType } from "./type";
import { useBarycentricStore } from "./barycenteric.store";
import { useShallow } from "zustand/shallow";

export function BarycentricUI() {
  const { type, setType } = useBarycentricStore(
    useShallow((s) => ({
      type: s.type,
      setType: s.setType,
    })),
  );

  return (
    <Select
      onValueChange={(value) => {
        const type_ = getBarycentricMaterialType(value);
        if (type_) {
          setType(type_);
        }
      }}
      value={type}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="shader를 선택해야합니다." />
      </SelectTrigger>
      <SelectContent className="bg-white text-black">
        <SelectGroup>
          {BarycentricMaterialTypes.map((type) => (
            <SelectItem key={`select-${type}`} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
