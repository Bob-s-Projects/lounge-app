import Link from "next/link";
import { FileText } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import productsData from "@/data/products.json";
import supplierData from "@/data/supplier_prices.json";
import salesData from "@/data/sales_summary.json";
import type { ProductsData, SupplierData } from "@/lib/types";
import {
  analyzeMenu,
  type SalesData,
  type MenuAnalysisItem,
  type Recommendation,
} from "@/lib/menu-analysis";
import { getProducts } from "@/lib/data";
import { PrintButton } from "./print-button";
import { DraftTabs } from "./draft-tabs";
import { MenuSection } from "./menu-section";
import type {
  MenuSectionKey,
  DraftStatus,
  DraftItem,
  DraftSection,
  DraftGroup,
} from "./types";

export const metadata = {
  title: "メニュー表ドラフト | 原価管理",
};

// ── Category mapping (from grand-menu/page.tsx) ──

function mapCategoryToSection(categoryName: string): MenuSectionKey {
  if (categoryName === "Bar time" || categoryName === "Bar time延長")
    return "ルーム料金";
  if (categoryName === "Cafe time" || categoryName === "Cafe time延長")
    return "ルーム料金";
  if (
    categoryName === "ハウスシーシャ" ||
    categoryName === "オーダーシーシャ" ||
    categoryName === "シーシャオプション"
  )
    return "シーシャ";
  if (categoryName === "ボトル") return "ボトル";
  if (categoryName === "フード" || categoryName === "カップ麺") return "フード";
  if (categoryName === "カクテル") return "カクテル";
  if (categoryName === "ワイン") return "ワイン";
  if (
    categoryName.includes("ワイン") &&
    categoryName.includes("ボトル")
  )
    return "ワイン";
  if (
    categoryName === "シャンパン" ||
    categoryName === "スパークリング" ||
    categoryName.includes("シャンパン") ||
    categoryName.includes("スパークリング")
  )
    return "シャンパン・スパークリング";
  if (categoryName === "ビール") return "ビール";
  if (categoryName === "ウィスキー" || categoryName === "ウイスキー")
    return "ウイスキー";
  if (categoryName === "ハイボール") return "ハイボール";
  if (categoryName === "焼酎" || categoryName === "サワー") return "焼酎・サワー";
  if (categoryName === "ソフトドリンク" || categoryName === "ノンアルコール")
    return "ソフトドリンク";
  if (
    categoryName === "通常かき氷" ||
    categoryName === "季節かき氷" ||
    categoryName === "氷ヲ刻メ" ||
    categoryName === "無料かき氷"
  )
    return "フード";
  if (
    categoryName === "アルコール" ||
    categoryName === "ショット" ||
    categoryName === "季節ドリンク" ||
    categoryName === "無料ドリンク"
  )
    return "その他ドリンク";
  if (
    categoryName === "チャージ" ||
    categoryName === "パーティ" ||
    categoryName === "箱貸し"
  )
    return "ルーム料金";
  if (
    categoryName === "サービス" ||
    categoryName === "手打ち商品＆損害請求" ||
    categoryName === "無料レンタル" ||
    categoryName === "シーシャ台オプション" ||
    categoryName === "オプション" ||
    categoryName === "アフヌン"
  )
    return "その他";
  return "その他";
}

// ── Section group definitions ──

const DRINK_SECTIONS: MenuSectionKey[] = [
  "ビール",
  "ウイスキー",
  "ハイボール",
  "カクテル",
  "ワイン",
  "シャンパン・スパークリング",
  "焼酎・サワー",
  "ソフトドリンク",
  "その他ドリンク",
];

const FOOD_SECTIONS: MenuSectionKey[] = ["フード"];
const SHISHA_SECTIONS: MenuSectionKey[] = ["シーシャ"];
const OTHER_SECTIONS: MenuSectionKey[] = ["ボトル", "ルーム料金", "その他"];

// ── Page ──

export default function MenuDraftPage() {
  const result = analyzeMenu(
    productsData as ProductsData,
    supplierData as SupplierData,
    salesData as SalesData,
  );
  const { items: analysisItems, deadStock } = result;

  // Build lookup maps
  const analysisMap = new Map<string, MenuAnalysisItem>();
  for (const item of analysisItems) {
    analysisMap.set(item.product_id, item);
  }
  const deadStockIds = new Set(deadStock.map((d) => d.product_id));

  // Get all active products
  const products = getProducts().filter((p) => p.display_flag === "1");

  // Build draft items
  const draftItems: DraftItem[] = products.map((p) => {
    const section = mapCategoryToSection(p.category_name);
    const analysis = analysisMap.get(p.product_id);
    const isDead = deadStockIds.has(p.product_id);

    let status: DraftStatus = "keep";
    let recommendation: Recommendation | null = null;
    let reason = "";

    if (isDead) {
      status = "dead_stock";
      reason = "過去90日間に販売実績なし";
    } else if (analysis) {
      recommendation = analysis.recommendation;
      reason = analysis.recommendation_reason;
      switch (analysis.recommendation) {
        case "consider_remove":
          // デッドストックのみ廃止。売上ありの低パフォーマンス品は維持
          status = "keep";
          break;
        case "review_price":
          status = "review_price";
          break;
        case "reduce_cost":
          status = "reduce_cost";
          break;
        case "promote":
          status = "promote";
          break;
        default:
          status = "keep";
          break;
      }
    }

    return {
      product_id: p.product_id,
      product_name: p.product_name,
      category_name: p.category_name,
      price: p.price,
      section,
      status,
      recommendation,
      recommendation_reason: reason,
      has_changes: status !== "keep",
    };
  });

  // Group by section
  const sectionMap = new Map<MenuSectionKey, DraftItem[]>();
  for (const item of draftItems) {
    const list = sectionMap.get(item.section) ?? [];
    list.push(item);
    sectionMap.set(item.section, list);
  }

  // Sort items within each section alphabetically
  for (const items of sectionMap.values()) {
    items.sort((a, b) => a.product_name.localeCompare(b.product_name, "ja"));
  }

  function buildSections(keys: MenuSectionKey[]): DraftSection[] {
    return keys
      .map((key) => ({
        key,
        label: key,
        items: sectionMap.get(key) ?? [],
      }))
      .filter((s) => s.items.length > 0);
  }

  const groups: DraftGroup[] = [
    { key: "drink", label: "ドリンク", sections: buildSections(DRINK_SECTIONS) },
    { key: "food", label: "フード", sections: buildSections(FOOD_SECTIONS) },
    { key: "shisha", label: "シーシャ", sections: buildSections(SHISHA_SECTIONS) },
    { key: "other", label: "その他", sections: buildSections(OTHER_SECTIONS) },
  ].filter((g) => g.sections.length > 0);

  // Summary counts
  const totalBefore = draftItems.length;
  const removeCount = draftItems.filter(
    (d) => d.status === "dead_stock",
  ).length;
  const totalAfter = totalBefore - removeCount;
  const priceReviewCount = draftItems.filter(
    (d) => d.status === "review_price" || d.status === "reduce_cost",
  ).length;
  const promoteCount = draftItems.filter((d) => d.status === "promote").length;

  return (
    <>
      <style>{printStyles}</style>
      <div className="draft-root flex flex-col gap-6 p-4 md:p-6 print:p-0 print:gap-0">
        {/* Screen navigation */}
        <div className="print:hidden">
          <BreadcrumbNav />
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <SidebarTrigger className="md:hidden" />
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              メニュー表ドラフト
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              現行メニューと提案メニューの比較
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/menu"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              分析に戻る
            </Link>
            <PrintButton />
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 print:grid-cols-5 print:gap-2 print:mb-4">
          <SummaryCard label="現行メニュー" value={`${totalBefore}品`} />
          <SummaryCard
            label="提案メニュー"
            value={`${totalAfter}品`}
            accent="emerald"
          />
          <SummaryCard
            label="デッドストック廃止"
            value={`${removeCount}品`}
            accent="red"
          />
          <SummaryCard
            label="価格検討"
            value={`${priceReviewCount}品`}
            accent="amber"
          />
          <SummaryCard
            label="強化推奨"
            value={`${promoteCount}品`}
            accent="blue"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-muted/30 px-4 py-3 text-xs print:rounded-none print:border-gray-400 print:bg-gray-50 print:text-[8pt] print:px-3 print:py-2">
          <span className="font-semibold text-sm print:text-[9pt]">凡例:</span>
          <LegendItem color="bg-gray-100 text-gray-600 print:border print:border-gray-400" label="デッドストック（販売ゼロ → 廃止）" />
          <LegendItem color="border-l-4 border-l-amber-400 bg-amber-50 text-amber-700" label="価格要検討" />
          <LegendItem color="border-l-4 border-l-orange-400 bg-orange-50 text-orange-700" label="原価改善" />
          <LegendItem color="border-l-4 border-l-blue-400 bg-blue-50 text-blue-700" label="強化推奨" />
          <LegendItem color="bg-white text-foreground print:bg-transparent" label="維持（変更なし）" />
        </div>

        {/* Tab navigation + content (client component) */}
        <DraftTabs groups={groups} />

        {/* Print sections - all groups rendered, stacked vertically */}
        <div className="hidden print:block">
          {groups.map((group) => (
            <div key={group.key} className="draft-print-group">
              <h2 className="text-[16pt] font-bold tracking-wider border-b-2 border-black pb-1 mb-4">
                {group.label}
              </h2>
              {group.sections.map((section) => (
                <div key={section.key} className="draft-print-section mb-6">
                  {/* BEFORE */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11pt] font-bold bg-gray-200 px-2 py-0.5">
                        BEFORE
                      </span>
                      <span className="text-[10pt] text-gray-600">
                        現行メニュー
                      </span>
                    </div>
                    <MenuSection section={section} mode="before" />
                  </div>
                  {/* AFTER */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11pt] font-bold bg-indigo-100 px-2 py-0.5">
                        AFTER
                      </span>
                      <span className="text-[10pt] text-gray-600">
                        提案メニュー
                      </span>
                    </div>
                    <MenuSection section={section} mode="after" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Summary Card ──

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "red" | "amber" | "blue" | "emerald";
}) {
  const accentMap = {
    red: "text-red-600 dark:text-red-400 print:text-black print:font-extrabold",
    amber: "text-amber-600 dark:text-amber-400 print:text-black",
    blue: "text-blue-600 dark:text-blue-400 print:text-black",
    emerald: "text-emerald-600 dark:text-emerald-400 print:text-black",
  };
  const valueColor = accent ? accentMap[accent] : "";

  return (
    <div className="rounded-xl border bg-card px-4 py-3 text-center print:rounded-none print:border-gray-400 print:px-2 print:py-2">
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider print:text-[7pt] print:text-gray-600">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums print:text-[16pt] ${valueColor}`}
      >
        {value}
      </div>
    </div>
  );
}

// ── Legend Item ──

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 ${color}`}>
      {label}
    </span>
  );
}

// ── Print CSS ──

const printStyles = `
/* ── Menu item styles (screen + print) ── */

.menu-section-card {
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--card, white);
}

.menu-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 8px;
}

.menu-section-header-line {
  flex: 1;
  height: 1px;
  background: var(--border, #d1d5db);
}

.menu-section-header-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  white-space: nowrap;
  color: var(--foreground, #111);
}

.menu-item {
  display: flex;
  align-items: baseline;
  padding: 5px 0;
  min-height: 28px;
}

.menu-item-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

.menu-item-dots {
  flex: 1;
  border-bottom: 1px dotted #ccc;
  margin: 0 6px;
  min-width: 12px;
  align-self: center;
  position: relative;
  top: -2px;
}

.menu-item-price {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--foreground, #111);
}

@media print {
  /* Hide app shell */
  [data-slot="sidebar"],
  [data-sidebar="sidebar"],
  nav[aria-label="パンくずリスト"],
  [data-slot="mobile-nav"],
  .print\\:hidden {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
    font-size: 10pt !important;
    line-height: 1.4 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  main {
    background: white !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  @page {
    size: A4 portrait;
    margin: 12mm 10mm;
  }

  .draft-root {
    max-width: none !important;
    padding: 0 !important;
  }

  .draft-tabs-screen {
    display: none !important;
  }

  .draft-print-group {
    page-break-before: always;
    padding-top: 0;
  }
  .draft-print-group:first-of-type {
    page-break-before: auto;
  }

  .draft-print-section {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  * {
    box-shadow: none !important;
  }

  .menu-section-card {
    border: 1pt solid #444 !important;
    border-radius: 0 !important;
    margin-bottom: 8pt;
  }

  .menu-section-header {
    padding: 8pt 10pt 5pt !important;
  }

  .menu-section-header-title {
    font-size: 12pt !important;
  }

  .menu-section-header-line {
    background: #666 !important;
  }

  .menu-item {
    padding: 3pt 0 !important;
    min-height: auto !important;
  }

  .menu-item-name {
    font-size: 9pt !important;
    max-width: 140px !important;
  }

  .menu-item-dots {
    border-color: #aaa !important;
  }

  .menu-item-price {
    font-size: 9pt !important;
  }
}
`;
