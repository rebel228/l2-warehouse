export interface L2ItemSearchResult {
  id: number;
  name: string;
  type: string;
  grade: string;
  weight: number;
  price: number;
  iconFile: string;
}

export interface L2ItemSearchResponse {
  data: L2ItemSearchResult[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface L2Item {
  id: number;
  name: string;
  type: string;
  grade: string;
  weight: number;
  price: number;
  material: string;
  iconFile: string;
}

export interface L2ItemDetail {
  id: number;
  name: string;
  type: string;
  grade: string;
  weight: number;
  price: number;
  category: {
    bodypart?: string;
    weaponType?: string;
  };
}
