import type { Recommendation } from "@/lib/menu-analysis";

export type MenuSectionKey =
  | "ビール"
  | "ウイスキー"
  | "ハイボール"
  | "カクテル"
  | "ワイン"
  | "シャンパン・スパークリング"
  | "焼酎・サワー"
  | "ソフトドリンク"
  | "その他ドリンク"
  | "フード"
  | "シーシャ"
  | "ボトル"
  | "ルーム料金"
  | "その他";

export type DraftStatus =
  | "remove"
  | "dead_stock"
  | "review_price"
  | "reduce_cost"
  | "promote"
  | "keep";

export type DraftItem = {
  product_id: string;
  product_name: string;
  category_name: string;
  price: number;
  section: MenuSectionKey;
  status: DraftStatus;
  recommendation: Recommendation | null;
  recommendation_reason: string;
  has_changes: boolean;
};

export type DraftSection = {
  key: MenuSectionKey;
  label: string;
  items: DraftItem[];
};

export type DraftGroup = {
  key: string;
  label: string;
  sections: DraftSection[];
};
