export type BarycentricMaterial = "blending" | "edge" | "point";

export const BarycentricMaterialTypes: BarycentricMaterial[] = [
  "blending",
  "edge",
  "point",
];

export const isBarycentricMaterialType = (rhs: BarycentricMaterial): boolean =>
  BarycentricMaterialTypes.find((val) => val === rhs)?.length ? true : false;

export const getBarycentricMaterialType = (rhs: string) =>
  BarycentricMaterialTypes.find((val) => val === rhs);
