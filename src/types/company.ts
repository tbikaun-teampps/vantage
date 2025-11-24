import type { DatabaseRow } from "./utils";

export type BusinessUnit = DatabaseRow<"business_units">;
export type Region = DatabaseRow<"regions">;
export type Site = DatabaseRow<"sites">;
export type AssetGroup = DatabaseRow<"asset_groups">;

// Tree structure interfaces
export type TreeNodeType =
  | "company"
  | "business_unit"
  | "region"
  | "site"
  | "asset_group"
  | "work_group"
  | "role";