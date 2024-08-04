export type CollectionSpot = {
  id: number;
  name: string;
  address: string;
  materials: string;
};

export type Material = {
  code: number;
  material_name: string;
};

export type Modify<T, R> = Omit<T, keyof R> & R;
