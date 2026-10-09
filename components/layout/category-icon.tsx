import {
  Bath,
  Box,
  BrickWall,
  ChefHat,
  DoorOpen,
  Droplets,
  Grid3x3,
  Hammer,
  Lamp,
  Layers,
  PaintRoller,
  PlugZap,
  ShieldCheck,
  Trees,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Ícones disponíveis para categorias (campo "icon" no painel) */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "brick-wall": BrickWall,
  "grid-3x3": Grid3x3,
  "paint-roller": PaintRoller,
  "plug-zap": PlugZap,
  droplets: Droplets,
  hammer: Hammer,
  bath: Bath,
  "chef-hat": ChefHat,
  "door-open": DoorOpen,
  lamp: Lamp,
  wrench: Wrench,
  trees: Trees,
  layers: Layers,
  "shield-check": ShieldCheck,
  box: Box,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICONS);

export function CategoryIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Icon = (name && CATEGORY_ICONS[name]) || Box;
  return <Icon className={className} aria-hidden="true" />;
}
