export type CollectionSpot = {
  id: number;
  name: string;
  address: string;
  opening_hours_fi: string;
  postal_code: string;
  post_office: string;
  materials: string;
};

export type Material = {
  code: number;
  name: string;
};

export type Modify<T, R> = Omit<T, keyof R> & R;

export type ChatResponse = {
  status: string;
  data: {
    conversation_id: string;
    response: string;
  };
};
