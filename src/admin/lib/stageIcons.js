import { Package, Cog, Settings2, SearchCheck, Flame, SprayCan, Disc3, KeySquare, Microscope, PackageCheck } from "lucide-react";

// One icon per process stage type — shared by job card cards, the Full/
// Detailed views, and Process Templates' timeline.
export const stageIcons = {
  raw_material: Package,
  machining: Cog,
  teeth_cutting: Settings2,
  pre_inspection: SearchCheck,
  hardening: Flame,
  blackening: SprayCan,
  bore_grinding: Disc3,
  keyway_cutting: KeySquare,
  final_inspection: Microscope,
  packaging_dispatch: PackageCheck,
};
