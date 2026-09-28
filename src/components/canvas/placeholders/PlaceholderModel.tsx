import type { ComponentType } from 'react';
import type { ProductCategory } from '@/types/catalog';
import { Armchair, RockingChair, SlipperChair } from './Chairs';
import { Artwork, Rug } from './Decor';
import { FloorLamp, Pendant } from './Lights';
import { Plant, Vase } from './Plants';
import type { PlaceholderProps } from './primitives';
import { CornerSofa, ModularSofa, StraightSofa } from './Seating';
import { Bookcase, Cabinet, Console, Dresser, WallShelf } from './Storage';
import { NestingTables, RectTable, RoundTable } from './Tables';

/** Forme provisoire de chaque catégorie, en attendant les vrais .glb. */
const PLACEHOLDERS: Record<ProductCategory, ComponentType<PlaceholderProps>> = {
  canapeAngle: CornerSofa,
  canape3Places: StraightSofa,
  canapeModulable: ModularSofa,
  tableRonde: RoundTable,
  tableRectangulaire: RectTable,
  tableGigogne: NestingTables,
  tapis: Rug,
  fauteuil: Armchair,
  chauffeuse: SlipperChair,
  rockingChair: RockingChair,
  meubleTV: Cabinet,
  console: Console,
  bibliotheque: Bookcase,
  vaisselier: Dresser,
  etagereMurale: WallShelf,
  suspension: Pendant,
  lampadaire: FloorLamp,
  plante: Plant,
  vase: Vase,
  tableau: Artwork,
};

interface PlaceholderModelProps extends PlaceholderProps {
  category: ProductCategory;
}

export function PlaceholderModel({ category, ...props }: PlaceholderModelProps) {
  const Shape = PLACEHOLDERS[category];
  return <Shape {...props} />;
}
