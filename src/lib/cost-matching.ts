import type { Product, SupplierItem, SupplierData } from "./types";

// ── Types ──────────────────────────────────────────────────────────

export type MatchType = "direct" | "recipe" | "unmatched";

export type CostMatch = {
  product_id: string;
  product_name: string;
  category_name: string;
  selling_price: number;
  estimated_cost: number;
  cost_ratio: number;
  match_type: MatchType;
  match_details: string;
  supplier_items: string[];
};

type RecipeIngredient = {
  keyword: string;
  amount_ml: number;
};

type Recipe = {
  ingredients: RecipeIngredient[];
};

// ── Helpers ────────────────────────────────────────────────────────

/** Parse spec string like "720ML", "1.8L", "2.7L", "10L", "4L" → ml */
function specToMl(spec: string): number {
  const s = spec.toUpperCase().replace(/\s/g, "");
  // Match "2.7Lペット" "1.8L" "10L" etc.
  const litreMatch = s.match(/([\d.]+)\s*L/);
  if (litreMatch) return parseFloat(litreMatch[1]) * 1000;
  // Match "720ML" "500ML" etc.
  const mlMatch = s.match(/([\d.]+)\s*ML/);
  if (mlMatch) return parseFloat(mlMatch[1]);
  // BIB gallon: "1ガロン" = 3785ml, "2.5ガロン" = 9463ml
  const gallonMatch = s.match(/([\d.]+)\s*ガロン/);
  if (gallonMatch) return parseFloat(gallonMatch[1]) * 3785;
  return 0;
}

/** Find the best supplier item matching a keyword, preferring recently shipped items */
function findSupplierItem(
  items: SupplierItem[],
  keyword: string
): SupplierItem | null {
  const candidates = items.filter((item) =>
    item.product_name.includes(keyword)
  );
  if (candidates.length === 0) return null;
  // Prefer items that have been shipped recently
  const shipped = candidates.filter((c) => c.last_shipped !== null);
  if (shipped.length > 0) {
    shipped.sort(
      (a, b) =>
        new Date(b.last_shipped!).getTime() -
        new Date(a.last_shipped!).getTime()
    );
    return shipped[0];
  }
  return candidates[0];
}

/** Calculate per-ml cost from a supplier item */
function perMlCost(item: SupplierItem): number {
  const ml = specToMl(item.spec);
  if (ml <= 0) return 0;
  // unit_price is per-bottle/per-unit price
  return item.unit_price / ml;
}

/** Calculate per-serving cost from a supplier item given serving size in ml */
function servingCost(item: SupplierItem, servingMl: number): number {
  return perMlCost(item) * servingMl;
}

// ── Direct match mappings ──────────────────────────────────────────

type DirectMatch = {
  /** Keywords to match POS product_name (any must match) */
  posKeywords: string[];
  /** Keyword to find in supplier data */
  supplierKeyword: string;
  /** Serving size in ml (for pouring from larger container). 0 = whole bottle. */
  servingMl: number;
  /** Override: if the supplier item is a keg/BIB, specify container volume keyword */
  containerSpec?: string;
};

const DIRECT_MATCHES: DirectMatch[] = [
  // Draft beer - 10L keg, ~350ml per glass
  {
    posKeywords: ["生ビール"],
    supplierKeyword: "アサヒスーパードライ 生樽 10L",
    servingMl: 350,
  },
  // Heineken bottle
  {
    posKeywords: ["ハイネケン"],
    supplierKeyword: "ハイネケン ロングネック",
    servingMl: 0,
  },
  // Non-alcohol beer
  {
    posKeywords: ["アサヒドライゼロ", "ノンアルコールビール"],
    supplierKeyword: "アサヒ ドライゼロ",
    servingMl: 0,
  },
  {
    posKeywords: ["オールフリー"],
    supplierKeyword: "オールフリー",
    servingMl: 0,
  },
  // Whisky shots/singles (45ml per serve)
  {
    posKeywords: ["山崎12年", "山崎 12年"],
    supplierKeyword: "サントリー 山崎 12年",
    servingMl: 30,
  },
  {
    posKeywords: ["山崎18年", "山崎 18年"],
    supplierKeyword: "サントリー 山崎 18年",
    servingMl: 30,
  },
  {
    posKeywords: ["山崎"],
    supplierKeyword: "サントリー シングルモルトウイスキー 山崎",
    servingMl: 30,
  },
  {
    posKeywords: ["白州12年", "白州 12年"],
    supplierKeyword: "サントリー 白州 12年",
    servingMl: 30,
  },
  {
    posKeywords: ["白州18年", "白州 18年"],
    supplierKeyword: "サントリー 白州 18年",
    servingMl: 30,
  },
  {
    posKeywords: ["白州"],
    supplierKeyword: "サントリー シングルモルトウイスキー 白州",
    servingMl: 30,
  },
  {
    posKeywords: ["知多"],
    supplierKeyword: "サントリー ウイスキー 知多",
    servingMl: 30,
  },
  {
    posKeywords: ["響 ブレンダーズ", "響ブレンダーズ"],
    supplierKeyword: "サントリー 響 BLENDER",
    servingMl: 30,
  },
  {
    posKeywords: ["響 21年", "響21年"],
    supplierKeyword: "サントリー 響 21年",
    servingMl: 30,
  },
  {
    posKeywords: ["シーバスミズナラ", "シーバスリーガルミズナラ"],
    supplierKeyword: "シーバスリーガル ミズナラ",
    servingMl: 30,
  },
  {
    posKeywords: ["ラフロイグ"],
    supplierKeyword: "ラフロイグ",
    servingMl: 30,
  },
  {
    posKeywords: ["マッカラン"],
    supplierKeyword: "マッカラン",
    servingMl: 30,
  },
  {
    posKeywords: ["グレンフィディック"],
    supplierKeyword: "グレンフィディック",
    servingMl: 30,
  },
  {
    posKeywords: ["ラガヴーリン"],
    supplierKeyword: "ラガヴーリン",
    servingMl: 30,
  },
  {
    posKeywords: ["ウッドフォードリザーブ"],
    supplierKeyword: "ウッドフォード リザーブ",
    servingMl: 30,
  },
  {
    posKeywords: ["カナディアンクラブ"],
    supplierKeyword: "カナディアンクラブ",
    servingMl: 30,
  },
  // Shochu
  {
    posKeywords: ["芋焼酎", "だいやめ"],
    supplierKeyword: "だいやめ",
    servingMl: 60,
  },
  {
    posKeywords: ["千年の眠り"],
    supplierKeyword: "千年の眠り",
    servingMl: 60,
  },
  {
    posKeywords: ["吉四六"],
    supplierKeyword: "吉四六",
    servingMl: 60,
  },
  // Umeshu
  {
    posKeywords: ["ゆめひびき"],
    supplierKeyword: "ゆめひびき",
    servingMl: 60,
  },
  {
    posKeywords: ["加賀"],
    supplierKeyword: "加賀梅酒",
    servingMl: 60,
  },
  // Champagne / Sparkling (full bottle)
  {
    posKeywords: ["モエシャン　ロゼ"],
    supplierKeyword: "モエ エ シャンドン ロゼ",
    servingMl: 0,
  },
  {
    posKeywords: ["モエシャン　ネクター"],
    supplierKeyword: "モエ エ シャンドン ネクター アンペリアル 白泡",
    servingMl: 0,
  },
  {
    posKeywords: ["モエシャン 　アイス"],
    supplierKeyword: "モエ エ シャンドン アイス",
    servingMl: 0,
  },
  {
    posKeywords: ["モエシャン"],
    supplierKeyword: "モエ エ シャンドン モエ アンペリアル 白泡",
    servingMl: 0,
  },
  {
    posKeywords: ["ローラン・ペリエ", "ローランペリエ"],
    supplierKeyword: "ローラン ペリエ",
    servingMl: 0,
  },
  {
    posKeywords: ["クリュッグ"],
    supplierKeyword: "クリュッグ",
    servingMl: 0,
  },
  {
    posKeywords: ["ヴーヴ・クリコ", "ヴーヴクリコ"],
    supplierKeyword: "ヴーヴ クリコ",
    servingMl: 0,
  },
  {
    posKeywords: ["ベル エポ"],
    supplierKeyword: "ベル エポック",
    servingMl: 0,
  },
  {
    posKeywords: ["クリスタル"],
    supplierKeyword: "クリスタル ブリュット",
    servingMl: 0,
  },
  {
    posKeywords: ["アルマンド"],
    supplierKeyword: "アルマンド",
    servingMl: 0,
  },
  {
    posKeywords: ["ボッテガ ゴールド"],
    supplierKeyword: "ボッテガ ゴールド NV 白泡",
    servingMl: 0,
  },
  {
    posKeywords: ["ボッテガ ロゼ"],
    supplierKeyword: "ボッテガ ロゼゴールド",
    servingMl: 0,
  },
  {
    posKeywords: ["カフェパ"],
    supplierKeyword: "カフェド パリ",
    servingMl: 0,
  },
  // Tequila shots
  {
    posKeywords: ["1800アネホ", "1800 アネホ"],
    supplierKeyword: "クエルボ 1800 テキーラ アネホ",
    servingMl: 45,
  },
  {
    posKeywords: ["1800レポサド", "1800 レポサド"],
    supplierKeyword: "クエルボ 1800 テキーラ レポサド",
    servingMl: 45,
  },
  // ハブ酒
  {
    posKeywords: ["ハブ酒"],
    supplierKeyword: "HABUSH",
    servingMl: 45,
  },
  // コカレロ / コカボム
  {
    posKeywords: ["コカボム"],
    supplierKeyword: "コカレロ",
    servingMl: 30,
  },
  // Red/White wine by glass (house wine from box)
  {
    posKeywords: ["赤ワイン"],
    supplierKeyword: "カルロ ロッシ レッド 3L",
    servingMl: 120,
  },
  {
    posKeywords: ["白ワイン"],
    supplierKeyword: "カルロ ロッシ ホワイト 3L",
    servingMl: 120,
  },
  // Wine bottles - red
  {
    posKeywords: ["ジュヴレ シャンベルタン"],
    supplierKeyword: "ジュヴレ シャンベルタン",
    servingMl: 0,
  },
  {
    posKeywords: ["シャンボール ミュジニー"],
    supplierKeyword: "シャンボール ミュジニー",
    servingMl: 0,
  },
  // Soft drinks
  {
    posKeywords: ["レッドブル"],
    supplierKeyword: "レッドブル",
    servingMl: 0,
  },
  {
    posKeywords: ["ヒルドン　ミネラルウォーター"],
    supplierKeyword: "ヒルドン スティル(無発泡)ミネラルウォーター 瓶#",
    servingMl: 0,
  },
  {
    posKeywords: ["ヒルドン　炭酸水"],
    supplierKeyword: "ヒルドン(発泡)ミネラルウォーター 瓶",
    servingMl: 0,
  },
  // Jasmine tea highball (茉莉花 shochu)
  {
    posKeywords: ["茉莉花"],
    supplierKeyword: "ジャスミン茉莉花",
    servingMl: 60,
  },
];

// ── Recipe mappings ────────────────────────────────────────────────

const RECIPES: Record<string, Recipe> = {
  // ── Alcohol (standard drinks) ──
  ハイボール: {
    ingredients: [
      { keyword: "角瓶", amount_ml: 45 },
      { keyword: "強炭酸水", amount_ml: 150 },
    ],
  },
  コークハイボール: {
    ingredients: [
      { keyword: "角瓶", amount_ml: 45 },
      { keyword: "コカコーラ", amount_ml: 150 },
    ],
  },
  ジンジャーハイボール: {
    ingredients: [
      { keyword: "角瓶", amount_ml: 45 },
      { keyword: "ジンジャーエール", amount_ml: 150 },
    ],
  },
  レモンサワー: {
    ingredients: [
      { keyword: "レモンサワーの素", amount_ml: 45 },
      { keyword: "強炭酸水", amount_ml: 150 },
    ],
  },
  ライムサワー: {
    ingredients: [
      { keyword: "甲焼酎", amount_ml: 45 },
      { keyword: "強炭酸水", amount_ml: 150 },
      { keyword: "ライム", amount_ml: 10 },
    ],
  },
  ウーロンハイ: {
    ingredients: [
      { keyword: "甲焼酎", amount_ml: 45 },
      { keyword: "烏龍茶", amount_ml: 150 },
    ],
  },
  ジャスミンハイ: {
    ingredients: [
      { keyword: "甲焼酎", amount_ml: 45 },
      { keyword: "ジャスミン茶", amount_ml: 150 },
    ],
  },
  緑茶ハイ: {
    ingredients: [
      { keyword: "甲焼酎", amount_ml: 45 },
      { keyword: "緑茶", amount_ml: 150 },
    ],
  },
  紅茶ハイ: {
    ingredients: [
      { keyword: "甲焼酎", amount_ml: 45 },
      { keyword: "紅茶", amount_ml: 150 },
    ],
  },
  麦茶ハイ: {
    ingredients: [
      { keyword: "甲焼酎", amount_ml: 45 },
      { keyword: "麦茶", amount_ml: 150 },
    ],
  },
  トウモロコシ茶ハイ: {
    ingredients: [
      { keyword: "甲焼酎", amount_ml: 45 },
      { keyword: "とうもろこし", amount_ml: 150 },
    ],
  },
  // ── Cocktails ──
  ジントニック: {
    ingredients: [
      { keyword: "ドライジン", amount_ml: 45 },
      { keyword: "トニックウォーター", amount_ml: 150 },
    ],
  },
  ジンバック: {
    ingredients: [
      { keyword: "ドライジン", amount_ml: 45 },
      { keyword: "ジンジャーエール", amount_ml: 120 },
      { keyword: "レモン", amount_ml: 10 },
    ],
  },
  ジンフィズ: {
    ingredients: [
      { keyword: "ドライジン", amount_ml: 45 },
      { keyword: "強炭酸水", amount_ml: 120 },
      { keyword: "レモン", amount_ml: 15 },
    ],
  },
  ジンライム: {
    ingredients: [
      { keyword: "ドライジン", amount_ml: 45 },
      { keyword: "ライム", amount_ml: 15 },
    ],
  },
  オレンジブロッサム: {
    ingredients: [
      { keyword: "ドライジン", amount_ml: 45 },
      { keyword: "オレンジ", amount_ml: 120 },
    ],
  },
  カシスオレンジ: {
    ingredients: [
      { keyword: "カシス", amount_ml: 30 },
      { keyword: "オレンジ", amount_ml: 120 },
    ],
  },
  カシスソーダ: {
    ingredients: [
      { keyword: "カシス", amount_ml: 30 },
      { keyword: "強炭酸水", amount_ml: 150 },
    ],
  },
  カシスウーロン: {
    ingredients: [
      { keyword: "カシス", amount_ml: 30 },
      { keyword: "烏龍茶", amount_ml: 150 },
    ],
  },
  カシスバック: {
    ingredients: [
      { keyword: "カシス", amount_ml: 30 },
      { keyword: "ジンジャーエール", amount_ml: 120 },
    ],
  },
  "カシス・ミルク": {
    ingredients: [
      { keyword: "カシス", amount_ml: 30 },
      { keyword: "豆乳", amount_ml: 120 },
    ],
  },
  モスコミュール: {
    ingredients: [
      { keyword: "ウオツカ", amount_ml: 45 },
      { keyword: "ジンジャーエール", amount_ml: 120 },
      { keyword: "ライム", amount_ml: 10 },
    ],
  },
  ウォッカトニック: {
    ingredients: [
      { keyword: "ウオツカ", amount_ml: 45 },
      { keyword: "トニックウォーター", amount_ml: 150 },
    ],
  },
  スクリュードライバー: {
    ingredients: [
      { keyword: "ウオツカ", amount_ml: 45 },
      { keyword: "オレンジ", amount_ml: 120 },
    ],
  },
  ブラッディメアリー: {
    ingredients: [
      { keyword: "ウオツカ", amount_ml: 45 },
      { keyword: "トマトジュース", amount_ml: 120 },
    ],
  },
  "ルシアン・コーク": {
    ingredients: [
      { keyword: "ウオツカ", amount_ml: 45 },
      { keyword: "コカコーラ", amount_ml: 120 },
    ],
  },
  レッドブルウォッカ: {
    ingredients: [
      { keyword: "ウオツカ", amount_ml: 45 },
      { keyword: "レッドブル", amount_ml: 250 },
    ],
  },
  ファジーネーブル: {
    ingredients: [
      { keyword: "ピーチ", amount_ml: 30 },
      { keyword: "オレンジ", amount_ml: 120 },
    ],
  },
  レゲエパンチ: {
    ingredients: [
      { keyword: "ピーチ", amount_ml: 30 },
      { keyword: "烏龍茶", amount_ml: 150 },
    ],
  },
  マリブコーク: {
    ingredients: [
      { keyword: "マリブ", amount_ml: 30 },
      { keyword: "コカコーラ", amount_ml: 120 },
    ],
  },
  マリブオレンジ: {
    ingredients: [
      { keyword: "マリブ", amount_ml: 30 },
      { keyword: "オレンジ", amount_ml: 120 },
    ],
  },
  マリブサーフ: {
    ingredients: [
      { keyword: "マリブ", amount_ml: 30 },
      { keyword: "強炭酸水", amount_ml: 90 },
      { keyword: "オレンジ", amount_ml: 60 },
    ],
  },
  ラムコーク: {
    ingredients: [
      { keyword: "ラム", amount_ml: 45 },
      { keyword: "コカコーラ", amount_ml: 120 },
    ],
  },
  キューバリブレ: {
    ingredients: [
      { keyword: "ラム", amount_ml: 45 },
      { keyword: "コカコーラ", amount_ml: 120 },
      { keyword: "ライム", amount_ml: 10 },
    ],
  },
  ラムトニック: {
    ingredients: [
      { keyword: "ラム", amount_ml: 45 },
      { keyword: "トニックウォーター", amount_ml: 150 },
    ],
  },
  ラムバック: {
    ingredients: [
      { keyword: "ラム", amount_ml: 45 },
      { keyword: "ジンジャーエール", amount_ml: 120 },
    ],
  },
  モヒート: {
    ingredients: [
      { keyword: "ラム", amount_ml: 45 },
      { keyword: "強炭酸水", amount_ml: 100 },
      { keyword: "ライム", amount_ml: 15 },
    ],
  },
  ピニャコラーダ: {
    ingredients: [
      { keyword: "ラム", amount_ml: 45 },
      { keyword: "マリブ", amount_ml: 15 },
      { keyword: "パイナップル", amount_ml: 90 },
    ],
  },
  テキーラサンライズ: {
    ingredients: [
      { keyword: "テキーラ ゴールド", amount_ml: 45 },
      { keyword: "オレンジ", amount_ml: 120 },
    ],
  },
  テキーラトニック: {
    ingredients: [
      { keyword: "テキーラ ゴールド", amount_ml: 45 },
      { keyword: "トニックウォーター", amount_ml: 150 },
    ],
  },
  メキシコーラ: {
    ingredients: [
      { keyword: "テキーラ ゴールド", amount_ml: 45 },
      { keyword: "コカコーラ", amount_ml: 120 },
    ],
  },
  ストローハット: {
    ingredients: [
      { keyword: "テキーラ ゴールド", amount_ml: 45 },
      { keyword: "トマトジュース", amount_ml: 120 },
    ],
  },
  "エル・ディアブロ": {
    ingredients: [
      { keyword: "テキーラ ゴールド", amount_ml: 45 },
      { keyword: "カシス", amount_ml: 15 },
      { keyword: "ジンジャーエール", amount_ml: 90 },
    ],
  },
  チャイナブルー: {
    ingredients: [
      { keyword: "ディタ", amount_ml: 30 },
      { keyword: "ブルー", amount_ml: 10 },
      { keyword: "グレープフルーツ", amount_ml: 120 },
    ],
  },
  ライチトニック: {
    ingredients: [
      { keyword: "ディタ", amount_ml: 30 },
      { keyword: "トニックウォーター", amount_ml: 150 },
    ],
  },
  ブルーハワイ: {
    ingredients: [
      { keyword: "ラム", amount_ml: 30 },
      { keyword: "ブルー", amount_ml: 15 },
      { keyword: "パイナップル", amount_ml: 60 },
      { keyword: "レモン", amount_ml: 15 },
    ],
  },
  バイオレットフィズ: {
    ingredients: [
      { keyword: "バイオレット", amount_ml: 30 },
      { keyword: "ドライジン", amount_ml: 15 },
      { keyword: "レモン", amount_ml: 15 },
      { keyword: "強炭酸水", amount_ml: 90 },
    ],
  },
  アマレットジンジャー: {
    ingredients: [
      { keyword: "アマレット", amount_ml: 30 },
      { keyword: "ジンジャーエール", amount_ml: 150 },
    ],
  },
  "ディサローノ・スプラッシュ": {
    ingredients: [
      { keyword: "アマレット", amount_ml: 30 },
      { keyword: "強炭酸水", amount_ml: 120 },
      { keyword: "オレンジ", amount_ml: 30 },
    ],
  },
  ミスティアジンジャー: {
    ingredients: [
      { keyword: "ミスティア", amount_ml: 30 },
      { keyword: "ジンジャーエール", amount_ml: 150 },
    ],
  },
  コーヒーミルク: {
    ingredients: [
      { keyword: "カルーア", amount_ml: 30 },
      { keyword: "豆乳", amount_ml: 120 },
    ],
  },
  ロイヤルミルクティー: {
    ingredients: [
      { keyword: "ティフィン", amount_ml: 30 },
      { keyword: "豆乳", amount_ml: 120 },
    ],
  },
  // Beer cocktails
  シャンディーガフ: {
    ingredients: [
      { keyword: "アサヒスーパードライ 生樽", amount_ml: 200 },
      { keyword: "ジンジャーエール", amount_ml: 150 },
    ],
  },
  レッドアイ: {
    ingredients: [
      { keyword: "アサヒスーパードライ 生樽", amount_ml: 200 },
      { keyword: "トマトジュース", amount_ml: 150 },
    ],
  },
  コークビア: {
    ingredients: [
      { keyword: "アサヒスーパードライ 生樽", amount_ml: 200 },
      { keyword: "コカコーラ", amount_ml: 150 },
    ],
  },
  エナジービア: {
    ingredients: [
      { keyword: "アサヒスーパードライ 生樽", amount_ml: 200 },
      { keyword: "レッドブル", amount_ml: 125 },
    ],
  },
  // Wine cocktails
  キール: {
    ingredients: [
      { keyword: "カルロ ロッシ ホワイト", amount_ml: 100 },
      { keyword: "カシス", amount_ml: 20 },
    ],
  },
  キティ: {
    ingredients: [
      { keyword: "カルロ ロッシ レッド", amount_ml: 100 },
      { keyword: "ジンジャーエール", amount_ml: 100 },
    ],
  },
  // Tequila bottle matching (for ボトル category)
  ニコラシカ: {
    ingredients: [
      { keyword: "コニャック", amount_ml: 45 },
    ],
  },
};

// Map of recipe ingredient keyword → specific supplier search keyword
// Avoids BIB concentrates (which are for fountain dispensers, not direct pour)
const MIXER_KEYWORDS: Record<string, { keyword: string; mlPerUnit: number }> = {
  オレンジ: { keyword: "なっちゃん オレンジ", mlPerUnit: 1500 },
  コカコーラ: { keyword: "コカコーラ R瓶", mlPerUnit: 207 },
  ジンジャーエール: { keyword: "ジンジャーエール 1.5L", mlPerUnit: 1500 },
  トニックウォーター: { keyword: "トニックウォーター R瓶", mlPerUnit: 207 },
  烏龍茶: { keyword: "烏龍茶 2L", mlPerUnit: 2000 },
  緑茶: { keyword: "緑茶 2L", mlPerUnit: 2000 },
  紅茶: { keyword: "無糖紅茶 2L", mlPerUnit: 2000 },
  麦茶: { keyword: "麦茶 2L", mlPerUnit: 2000 },
  ジャスミン茶: { keyword: "ジャスミン茶 2L", mlPerUnit: 2000 },
  とうもろこし: { keyword: "とうもろこしのひげ茶", mlPerUnit: 2000 },
  強炭酸水: { keyword: "強炭酸水 1L", mlPerUnit: 1000 },
  パイナップル: { keyword: "パイナップル 紙パック", mlPerUnit: 1000 },
  トマトジュース: { keyword: "トマトジュース ペット", mlPerUnit: 800 },
  グレープフルーツ: { keyword: "グレープフルーツ パック", mlPerUnit: 1000 },
  レモン: { keyword: "MY レモン", mlPerUnit: 1000 },
  ライム: { keyword: "ライム果汁入り", mlPerUnit: 600 },
  豆乳: { keyword: "豆乳", mlPerUnit: 1000 },
};

// ── Core matching function ─────────────────────────────────────────

/** Strip ★ and S prefix from product name for matching */
function normalizeProductName(name: string): string {
  return name.replace(/^[★S]+/g, "").trim();
}

/** Find an ingredient cost from supplier items */
function findIngredientCost(
  keyword: string,
  amountMl: number,
  items: SupplierItem[]
): { cost: number; supplierName: string; detail: string } | null {
  // 1. Check MIXER_KEYWORDS first (more specific, avoids BIB concentrates)
  const mixer = MIXER_KEYWORDS[keyword];
  if (mixer) {
    const mixerItem = findSupplierItem(items, mixer.keyword);
    if (mixerItem) {
      const ml = specToMl(mixerItem.spec);
      const effectiveMl = ml > 0 ? ml : mixer.mlPerUnit;
      const cost = (mixerItem.unit_price / effectiveMl) * amountMl;
      return {
        cost,
        supplierName: mixerItem.product_name,
        detail: `${keyword}${amountMl}ml(${formatCost(cost)})`,
      };
    }
  }

  // 2. Try direct supplier item match
  const supplierItem = findSupplierItem(items, keyword);
  if (supplierItem) {
    const ml = specToMl(supplierItem.spec);
    if (ml > 0) {
      const cost = (supplierItem.unit_price / ml) * amountMl;
      return {
        cost,
        supplierName: supplierItem.product_name,
        detail: `${keyword}${amountMl}ml(${formatCost(cost)})`,
      };
    }
    // For items where spec doesn't parse (e.g. individual cans/bottles)
    if (amountMl === 0 || amountMl >= 200) {
      return {
        cost: supplierItem.unit_price,
        supplierName: supplierItem.product_name,
        detail: `${keyword}(${formatCost(supplierItem.unit_price)})`,
      };
    }
  }

  return null;
}

function formatCost(cost: number): string {
  return `\u00a5${Math.round(cost)}`;
}

// ── Non-drink categories (skip matching) ───────────────────────────

const SKIP_CATEGORIES = new Set([
  "Bar time",
  "Bar time延長",
  "Cafe time",
  "Cafe time延長",
  "サービス",
  "シーシャオプション",
  "シーシャ台オプション",
  "オーダーシーシャ",
  "ハウスシーシャ",
  "パーティ",
  "手打ち商品＆損害請求",
  "無料レンタル",
  "箱貸し",
  "チャージ",
]);

// ── Main export ────────────────────────────────────────────────────

export function matchCosts(
  products: Product[],
  supplierData: SupplierData
): CostMatch[] {
  const items = supplierData.items;

  return products.map((product) => {
    const base: Omit<CostMatch, "estimated_cost" | "cost_ratio" | "match_type" | "match_details" | "supplier_items"> = {
      product_id: product.product_id,
      product_name: product.product_name,
      category_name: product.category_name,
      selling_price: product.price,
    };

    // Skip non-matchable categories
    if (SKIP_CATEGORIES.has(product.category_name)) {
      return {
        ...base,
        estimated_cost: 0,
        cost_ratio: 0,
        match_type: "unmatched" as const,
        match_details: "対象外カテゴリ",
        supplier_items: [],
      };
    }

    // Skip zero-price items (free drinks, service items)
    if (product.price <= 0) {
      return {
        ...base,
        estimated_cost: 0,
        cost_ratio: 0,
        match_type: "unmatched" as const,
        match_details: "無料商品",
        supplier_items: [],
      };
    }

    const normalized = normalizeProductName(product.product_name);

    // 1. Try direct matches (more specific matches first)
    for (const dm of DIRECT_MATCHES) {
      const matched = dm.posKeywords.some(
        (kw) =>
          normalized.includes(kw) ||
          product.product_name.includes(kw)
      );
      if (!matched) continue;

      const supplierItem = findSupplierItem(items, dm.supplierKeyword);
      if (!supplierItem) continue;

      let cost: number;
      let detail: string;

      if (dm.servingMl === 0) {
        // Whole bottle/can
        cost = supplierItem.unit_price;
        detail = `${supplierItem.product_name}(${formatCost(cost)})`;
      } else {
        cost = servingCost(supplierItem, dm.servingMl);
        detail = `${dm.supplierKeyword.split(" ").slice(0, 3).join(" ")} ${dm.servingMl}ml(${formatCost(cost)})`;
      }

      const ratio = cost / product.price;

      return {
        ...base,
        estimated_cost: Math.round(cost),
        cost_ratio: Math.round(ratio * 1000) / 1000,
        match_type: "direct" as const,
        match_details: detail,
        supplier_items: [supplierItem.product_name],
      };
    }

    // 2. Try recipe matches
    // Find recipe key: strip prefix, check exact name or partial
    let recipeKey: string | null = null;
    for (const key of Object.keys(RECIPES)) {
      if (normalized === key || normalized.includes(key)) {
        recipeKey = key;
        break;
      }
    }

    if (recipeKey) {
      const recipe = RECIPES[recipeKey];
      let totalCost = 0;
      const details: string[] = [];
      const supplierNames: string[] = [];
      let allFound = true;

      for (const ingredient of recipe.ingredients) {
        const result = findIngredientCost(
          ingredient.keyword,
          ingredient.amount_ml,
          items
        );
        if (result) {
          totalCost += result.cost;
          details.push(result.detail);
          supplierNames.push(result.supplierName);
        } else {
          allFound = false;
        }
      }

      if (details.length > 0) {
        const ratio = totalCost / product.price;
        return {
          ...base,
          estimated_cost: Math.round(totalCost),
          cost_ratio: Math.round(ratio * 1000) / 1000,
          match_type: "recipe" as const,
          match_details: details.join(" + "),
          supplier_items: supplierNames,
        };
      }
    }

    // 3. Bottle category whisky matching (bottle = full bottle)
    if (product.category_name === "ボトル") {
      // Try to find matching supplier item by product name
      const bottleKeywords: [string, string][] = [
        ["山崎 18年", "サントリー 山崎 18年"],
        ["山崎 12年", "サントリー 山崎 12年"],
        ["山崎", "サントリー シングルモルトウイスキー 山崎"],
        ["白州 18年", "サントリー 白州 18年"],
        ["白州 12年", "サントリー 白州 12年"],
        ["白州", "サントリー シングルモルトウイスキー 白州"],
        ["響 21年", "サントリー 響 21年"],
        ["響 ブレンダーズ", "サントリー 響 BLENDER"],
        ["マッカラン", "マッカラン"],
        ["シーバスリーガルミズナラ", "シーバスリーガル ミズナラ"],
        ["1800 アネホ", "クエルボ 1800 テキーラ アネホ"],
        ["1800 レポサド", "クエルボ 1800 テキーラ レポサド"],
        ["吉四六", "吉四六"],
        ["ハブ酒", "HABUSH"],
      ];

      for (const [posKw, supplierKw] of bottleKeywords) {
        if (!normalized.includes(posKw)) continue;
        const supplierItem = findSupplierItem(items, supplierKw);
        if (!supplierItem) continue;

        const cost = supplierItem.unit_price;
        const ratio = cost / product.price;
        return {
          ...base,
          estimated_cost: Math.round(cost),
          cost_ratio: Math.round(ratio * 1000) / 1000,
          match_type: "direct" as const,
          match_details: `ボトル: ${supplierItem.product_name}(${formatCost(cost)})`,
          supplier_items: [supplierItem.product_name],
        };
      }
    }

    // 4. Unmatched
    return {
      ...base,
      estimated_cost: 0,
      cost_ratio: 0,
      match_type: "unmatched" as const,
      match_details: "未マッチ",
      supplier_items: [],
    };
  });
}
