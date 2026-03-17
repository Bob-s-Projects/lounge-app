import Link from "next/link";
import productsData from "@/data/products.json";
import supplierData from "@/data/supplier_prices.json";
import salesData from "@/data/sales_summary.json";
import type { ProductsData, SupplierData } from "@/lib/types";
import {
  analyzeMenu,
  type SalesData,
  type MenuAnalysisItem,
} from "@/lib/menu-analysis";
import { getProducts, getSalesProducts } from "@/lib/data";
import { formatYen, formatNumber, formatPercent } from "@/lib/format";
import { PrintButton } from "./print-button";

export const metadata = {
  title: "メニュー改廃提案書 | 原価管理",
};

const YEN = (v: number) => formatYen(v);
const NUM = (v: number) => formatNumber(v);
const PCT = (v: number | null) => (v !== null ? formatPercent(v) : "—");

// ── Visibility issue categories ──
const WINE_BOTTLE_CATS = new Set(["赤ワイン ボトル", "白ワイン ボトル", "ワイン"]);
const CHAMPAGNE_CATS = new Set(["シャンパン", "スパークリング"]);
const WHISKY_BOTTLE_CAT = "ボトル";

function isWineBottle(cat: string, name: string) {
  if (WINE_BOTTLE_CATS.has(cat)) return true;
  if (cat === "ワイン" && !name.includes("グラス")) return true;
  return false;
}

function isChampagne(cat: string) {
  return CHAMPAGNE_CATS.has(cat) || cat.includes("シャンパン") || cat.includes("スパークリング");
}

function isWhiskyBottle(cat: string, price: number) {
  return cat === WHISKY_BOTTLE_CAT && price >= 20000;
}

function isPremiumCocktail(cat: string, price: number) {
  return cat === "カクテル" && price >= 1000;
}

// Categories that are NOT real menu items — exclude from all analysis
const EXCLUDED_CATEGORIES = new Set(["手打ち商品＆損害請求"]);

// Items that clearly don't fit lounge concept
const CUT_KEYWORDS = ["ソーダフロート", "ナタデココ", "フロート"];
const CUT_NAMES = new Set(["エナジービア", "コークビア", "ピッチャー白", "ピッチャー銀"]);

function shouldDefinitelyCut(name: string, cat: string) {
  if (CUT_KEYWORDS.some(kw => name.includes(kw))) return true;
  if (CUT_NAMES.has(name)) return true;
  if (cat === "アフヌン") return true;
  return false;
}

export default function ReportPage() {
  const result = analyzeMenu(
    productsData as ProductsData,
    supplierData as SupplierData,
    salesData as SalesData,
  );
  const { items, deadStock, summary } = result;
  const products = getProducts();
  const salesProducts = getSalesProducts();

  // Build sales lookup
  const salesMap = new Map<string, { qty: number; rev: number; txn: number }>();
  for (const sp of salesProducts) {
    salesMap.set(sp.product_id, { qty: sp.total_quantity, rev: sp.total_sales, txn: sp.transaction_count });
  }

  // Analysis lookup
  const analysisMap = new Map<string, MenuAnalysisItem>();
  for (const item of items) analysisMap.set(item.product_id, item);

  // Dead stock product details
  const deadStockProducts = deadStock.map(d => {
    const p = products.find(pr => pr.product_id === d.product_id);
    return { ...d, category_name: p?.category_name ?? d.category_name };
  });

  // ── Classify dead stock into visibility vs cut ──
  type VisibilityItem = { product_id: string; product_name: string; category_name: string; selling_price: number; reason: string; group: string };
  type CutItem = { product_id: string; product_name: string; category_name: string; selling_price: number; reason: string };

  const visibilityItems: VisibilityItem[] = [];
  const cutItems: CutItem[] = [];
  const holdItems: CutItem[] = [];

  for (const d of deadStockProducts.filter(d => !EXCLUDED_CATEGORIES.has(d.category_name))) {
    if (shouldDefinitelyCut(d.product_name, d.category_name)) {
      cutItems.push({ ...d, reason: "ラウンジのコンセプトに合わない" });
    } else if (isWineBottle(d.category_name, d.product_name)) {
      visibilityItems.push({ ...d, reason: "グラスワインは売れてるのにボトルがゼロ。メニューで見えてないだけかも？", group: "ワインボトル" });
    } else if (isChampagne(d.category_name)) {
      visibilityItems.push({ ...d, reason: "ヴーヴクリコとか有名どころは出る。他はスタッフからおすすめしたら売れそう", group: "シャンパン" });
    } else if (isWhiskyBottle(d.category_name, d.selling_price)) {
      visibilityItems.push({ ...d, reason: "グラスでは人気なのにボトルキープの提案ができてない", group: "ウイスキーボトル" });
    } else if (isPremiumCocktail(d.category_name, d.selling_price)) {
      visibilityItems.push({ ...d, reason: "¥800のカクテルはほぼ売れるのに¥1,000超えると急に売れない。メニューの並びの問題かも", group: "プレミアムカクテル" });
    } else if (d.selling_price >= 5000) {
      visibilityItems.push({ ...d, reason: "高い商品はメニュー見ただけじゃ頼まない。スタッフが声かけてなんぼ", group: "高額商品" });
    } else {
      holdItems.push({ ...d, reason: "90日間販売ゼロ" });
    }
  }

  // Low-sales items (consider_remove from analysis)
  const considerRemove = items.filter(i => i.recommendation === "consider_remove" && !EXCLUDED_CATEGORIES.has(i.category_name));
  for (const item of considerRemove) {
    if (shouldDefinitelyCut(item.product_name, item.category_name)) {
      cutItems.push({ product_id: item.product_id, product_name: item.product_name, category_name: item.category_name, selling_price: item.selling_price, reason: item.recommendation_reason });
    } else {
      holdItems.push({ product_id: item.product_id, product_name: item.product_name, category_name: item.category_name, selling_price: item.selling_price, reason: item.recommendation_reason });
    }
  }

  // Price revision items
  const priceItems = items.filter(i => (i.recommendation === "review_price" || i.recommendation === "reduce_cost") && !EXCLUDED_CATEGORIES.has(i.category_name));

  // Promotion items
  const promoteItems = items.filter(i => i.recommendation === "promote" && !EXCLUDED_CATEGORIES.has(i.category_name));

  // Group visibility items
  const visibilityGroups = new Map<string, VisibilityItem[]>();
  for (const v of visibilityItems) {
    const list = visibilityGroups.get(v.group) ?? [];
    list.push(v);
    visibilityGroups.set(v.group, list);
  }

  // Revenue potential calculations (realistic)
  const wineCount = visibilityItems.filter(v => v.group === "ワインボトル").length;
  const wineAvgPrice = wineCount > 0 ? Math.round(visibilityItems.filter(v => v.group === "ワインボトル").reduce((s, v) => s + v.selling_price, 0) / wineCount) : 0;
  const champCount = visibilityItems.filter(v => v.group === "シャンパン").length;
  const champAvgPrice = champCount > 0 ? Math.round(visibilityItems.filter(v => v.group === "シャンパン").reduce((s, v) => s + v.selling_price, 0) / champCount) : 0;
  const whiskyCount = visibilityItems.filter(v => v.group === "ウイスキーボトル").length;
  const whiskyAvgPrice = whiskyCount > 0 ? Math.round(visibilityItems.filter(v => v.group === "ウイスキーボトル").reduce((s, v) => s + v.selling_price, 0) / whiskyCount) : 0;

  // Realistic: wine 3/mo, champ 3/mo, whisky 2/mo, cocktail covered by price change
  const wineMonthly = wineAvgPrice * 3;
  const champMonthly = champAvgPrice * 3;
  const whiskyMonthly = whiskyAvgPrice * 2;
  const totalMonthlyPotential = wineMonthly + champMonthly + whiskyMonthly;

  const period = (salesData as SalesData).period;

  return (
    <>
      <style>{printStyles}</style>
      <div className="report-root mx-auto max-w-[210mm] space-y-10 p-6 md:p-10 print:max-w-none print:p-0 print:space-y-0">
        {/* Screen-only navigation */}
        <div className="flex items-center gap-3 print:hidden">
          <Link href="/menu" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            改廃アドバイスに戻る
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/menu/report/feedback" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted transition-colors">フィードバック入力</Link>
            <PrintButton />
          </div>
        </div>

        {/* ===== PAGE 1: Cover + Summary ===== */}
        <div className="report-page">
          <header className="report-header text-center pt-4 pb-6 mb-6 border-b-2 border-gray-800 print:border-black">
            <h1 className="text-3xl font-bold tracking-wider print:text-[22pt]">LEDIAN Lounge</h1>
            <h2 className="mt-2 text-xl font-semibold print:text-[16pt]">メニューをもっと良くしよう会議</h2>
            <p className="mt-2 text-lg text-gray-600 print:text-[11pt]">〜 やめるだけじゃもったいない、「見せ方」で売上は変わる！ 〜</p>
            <div className="mt-5 text-base text-gray-600 print:text-gray-700 print:text-[11pt]">
              <div>作成日: 2026年3月17日</div>
              <div className="mt-1">分析対象: {period.from} 〜 {period.to}（約{summary.periodMonths}ヶ月 / {NUM(1158)}会計）</div>
            </div>
          </header>

          {/* Meeting Agenda */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-8 print:rounded-none print:border-gray-400">
            <div className="bg-gray-800 text-white px-6 py-3 print:bg-black">
              <h3 className="text-lg font-bold tracking-wide print:text-[13pt]">会議アジェンダ</h3>
              <p className="text-sm text-gray-300 mt-0.5 print:text-[9pt] print:text-gray-400">2026年3月17日 メニュー改善ミーティング</p>
            </div>
            <div className="divide-y divide-gray-200">
              <AgendaRow num="1" title="まずはこれ見て！" time="5分" desc="売れてない商品の半分、実は見せ方の問題だった" />
              <AgendaRow num="2" title="もっと売れるはず！" time="15分" desc="ワイン・シャンパン・ウイスキー・カクテル、どう推していく？" />
              <AgendaRow num="3" title="これはなくそう" time="10分" desc="うちっぽくない商品をスッキリ整理しよう" />
              <AgendaRow num="4" title="値段どうする？" time="10分" desc="原価が高いやつ、値上げする？レシピ変える？" />
              <AgendaRow num="5" title="推していきたい！" time="5分" desc="利益率いいのに埋もれてる商品、もったいない" />
              <AgendaRow num="6" title="じゃあ何する？" time="10分" desc="今週やること・今月やること、ここで決めちゃおう" />
            </div>
            <div className="bg-gray-50 px-6 py-2.5 text-sm text-gray-600 font-medium print:bg-gray-100 print:text-[9pt]">
              だいたい1時間くらい ／ この資料を順番に見ながら話していきます
            </div>
          </div>

          {/* Key Finding */}
          <div className="border-2 border-red-300 bg-red-50/50 rounded-lg p-6 mb-6 print:rounded-none print:border-red-400 print:bg-red-50">
            <h3 className="text-xl font-bold text-red-800 print:text-[14pt]">データを見てわかったこと</h3>
            <p className="mt-3 text-base leading-[1.9] text-gray-800 print:text-[11pt]">
              90日間で売上ゼロの商品が86個あるけど、<strong>半分くらいは「お客さんに見えてないだけ」</strong>っぽい。
              <br />
              例えばワインボトルは全10本ゼロなのに、グラスワインは売れてる。
              シャンパンもヴーヴクリコは出るのに他は全然。
              <strong>商品が悪いんじゃなくて、知られてない・すすめてない</strong>のが原因。
              <br />
              ちゃんと見せれば<strong>月{YEN(totalMonthlyPotential)}くらいの売上アップ</strong>がいけそう！
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 print:grid-cols-4 print:gap-3">
            <SummaryBox label="見せ方で売れる！" value={`${visibilityItems.length}品`} sub={`月+${YEN(totalMonthlyPotential)}`} highlight="blue" />
            <SummaryBox label="なくしてOK" value={`${cutItems.length}品`} sub="うちっぽくない" highlight="red" />
            <SummaryBox label="値段を見直す" value={`${priceItems.length}品`} sub="原価が高め" highlight="amber" />
            <SummaryBox label="もっと推したい" value={`${promoteItems.length}品`} sub="利益率◎なのに埋もれてる" highlight="emerald" />
          </div>

          {/* Revenue Potential */}
          <div className="mt-6 border rounded-lg overflow-hidden print:rounded-none print:border-gray-400">
            <div className="bg-blue-50 px-5 py-3 border-b font-bold text-base print:bg-blue-100 print:text-[11pt]">
              ちゃんと見せたらこれくらい売れそう
            </div>
            <table className="w-full text-base print:text-[9pt]">
              <thead>
                <tr className="bg-gray-50 print:bg-gray-100">
                  <th className="border-b px-5 py-3 text-left font-semibold">カテゴリ</th>
                  <th className="border-b px-5 py-3 text-right font-semibold">対象</th>
                  <th className="border-b px-5 py-3 text-right font-semibold">平均単価</th>
                  <th className="border-b px-5 py-3 text-right font-semibold">想定販売</th>
                  <th className="border-b px-5 py-3 text-right font-semibold">月間増収</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b px-5 py-2.5 font-medium">ワインボトル</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums">{wineCount}本</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums">{YEN(wineAvgPrice)}</td>
                  <td className="border-b px-5 py-2.5 text-right">3本/月</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums font-bold">{YEN(wineMonthly)}</td>
                </tr>
                <tr>
                  <td className="border-b px-5 py-2.5 font-medium">シャンパン</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums">{champCount}本</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums">{YEN(champAvgPrice)}</td>
                  <td className="border-b px-5 py-2.5 text-right">3本/月</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums font-bold">{YEN(champMonthly)}</td>
                </tr>
                <tr>
                  <td className="border-b px-5 py-2.5 font-medium">ウイスキーボトル</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums">{whiskyCount}本</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums">{YEN(whiskyAvgPrice)}</td>
                  <td className="border-b px-5 py-2.5 text-right">2本/月</td>
                  <td className="border-b px-5 py-2.5 text-right tabular-nums font-bold">{YEN(whiskyMonthly)}</td>
                </tr>
                <tr className="bg-blue-50/50 print:bg-blue-50">
                  <td className="px-5 py-2.5 font-bold" colSpan={4}>合計（月間）</td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-bold text-lg text-blue-700 print:text-black print:text-[12pt]">{YEN(totalMonthlyPotential)}</td>
                </tr>
                <tr className="print:bg-blue-50">
                  <td className="px-5 py-2.5 font-bold text-blue-700 print:text-black" colSpan={4}>年間換算</td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-bold text-lg text-blue-700 print:text-black print:text-[12pt]">{YEN(totalMonthlyPotential * 12)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== SECTION: 露出改善提案 ===== */}
        <div className="report-page">
          <h2 className="report-section-title text-2xl">1. 見せ方を変えれば売れる！（{visibilityItems.length}品）</h2>
          <p className="text-base text-gray-700 mb-6 leading-relaxed print:text-[10pt] print:mb-3">
            この商品たち、お客さんに嫌われてるわけじゃない。ただ「知られてないだけ」。
            メニューの配置やスタッフのおすすめで全然変わるはず。
          </p>

          {Array.from(visibilityGroups.entries()).map(([group, groupItems]) => (
            <div key={group} className="mb-10 print:mb-5">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3 print:text-[14pt]">
                <span className="inline-block w-2 h-7 bg-blue-500 rounded-full print:bg-blue-600" />
                {group}（{groupItems.length}品）
              </h3>

              {/* Evidence box */}
              <div className="bg-blue-50 border-l-4 border-blue-400 px-5 py-4 mb-5 text-lg leading-relaxed text-gray-700 rounded-r-lg print:rounded-none print:text-[11pt] print:bg-blue-50">
                {groupItems[0]?.reason}
              </div>

              <div className="space-y-5 print:space-y-3">
                {groupItems.sort((a, b) => b.selling_price - a.selling_price).map(item => (
                  <div key={item.product_id} className="report-card border-2 border-gray-200 rounded-xl p-6 print:rounded-none print:p-4">
                    <div className="text-2xl font-bold print:text-[16pt]">{item.product_name}</div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-base text-gray-500 print:text-[10pt]">{item.category_name}</span>
                      <span className="text-2xl font-black tabular-nums print:text-[16pt]">{YEN(item.selling_price)}</span>
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-lg print:text-[11pt] print:mt-3 print:pt-2">
                      <label className="flex items-center gap-2 font-medium"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> メニュー配置変更</label>
                      <label className="flex items-center gap-2 font-medium"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> スタッフ推薦</label>
                      <label className="flex items-center gap-2 font-medium"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> POP・ビジュアル</label>
                      <label className="flex items-center gap-2 font-medium"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> 保留</label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action suggestion */}
              <div className="mt-6 bg-gray-50 rounded-xl px-6 py-5 print:rounded-none print:bg-gray-100 print:px-4 print:py-3">
                <div className="text-lg font-bold mb-3 print:text-[12pt]">具体的に何する？</div>
                <div className="border-b-2 border-dotted border-gray-300 min-h-[36px] print:min-h-[18pt]">&nbsp;</div>
                <div className="border-b-2 border-dotted border-gray-300 min-h-[36px] mt-3 print:min-h-[18pt]">&nbsp;</div>
                <div className="border-b-2 border-dotted border-gray-300 min-h-[36px] mt-3 print:min-h-[18pt]">&nbsp;</div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== SECTION: 廃止提案 ===== */}
        <div className="report-page">
          <h2 className="report-section-title text-2xl">2. メニューからなくしてスッキリ（{cutItems.length}品）</h2>
          <p className="text-base text-gray-700 mb-5 leading-relaxed print:text-[10pt] print:mb-3">
            LEDIANの雰囲気に合わない商品たち。メニューを見やすくするためにも整理しよう。
          </p>
          <div className="space-y-4 print:space-y-2">
            {cutItems.sort((a, b) => b.selling_price - a.selling_price).map(item => (
              <div key={item.product_id} className="report-card border-2 border-gray-200 rounded-xl p-5 print:rounded-none print:p-3">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-xl font-bold print:text-[14pt]">{item.product_name}</div>
                  <div className="text-xl font-black tabular-nums print:text-[14pt]">{YEN(item.selling_price)}</div>
                </div>
                <div className="text-base text-gray-500 mt-1 print:text-[9pt]">{item.category_name}</div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-8 text-lg font-medium print:text-[11pt] print:mt-2 print:pt-1.5">
                  <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> やめる</label>
                  <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> 残す</label>
                  <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> 保留</label>
                </div>
              </div>
            ))}
          </div>

          {holdItems.length > 0 && (
            <>
              <h3 className="text-lg font-bold mt-10 mb-4 print:text-[13pt] print:mt-5">ちょっと迷うやつ（{holdItems.length}品）</h3>
              <p className="text-base text-gray-700 mb-4 print:text-[10pt]">売上は少ないけど、なくすか見せ方を変えるか、みんなで相談したい。</p>
              <div className="space-y-4 print:space-y-2">
                {holdItems.sort((a, b) => b.selling_price - a.selling_price).map(item => {
                  const sales = salesMap.get(item.product_id);
                  return (
                    <div key={item.product_id} className="report-card border-2 border-gray-200 rounded-xl p-5 print:rounded-none print:p-3">
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="text-xl font-bold print:text-[14pt]">{item.product_name}</div>
                        <div className="text-xl font-black tabular-nums print:text-[14pt]">{YEN(item.selling_price)}</div>
                      </div>
                      <div className="text-base text-gray-500 mt-1 print:text-[9pt]">
                        {item.category_name}
                        {sales ? ` ／ ${NUM(sales.qty)}個売れた ／ ${YEN(sales.rev)}` : " ／ 90日間ゼロ"}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-8 text-lg font-medium print:text-[11pt] print:mt-2 print:pt-1.5">
                        <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> やめる</label>
                        <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> 見せ方変える</label>
                        <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> 保留</label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ===== SECTION: 価格改定 ===== */}
        {priceItems.length > 0 && (
          <div className="report-page">
            <h2 className="report-section-title text-2xl">3. 値段ちょっと考えたい（{priceItems.length}品）</h2>
            <p className="text-base text-gray-700 mb-5 leading-relaxed print:text-[10pt] print:mb-3">
              原価が高くて利益が出にくい商品。値上げするか、レシピを工夫するか考えよう。
            </p>
            <div className="space-y-4 print:space-y-3">
              {priceItems.map(item => (
                <PriceCard key={item.product_id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* ===== SECTION: 強化推奨 ===== */}
        {promoteItems.length > 0 && (
          <div className="report-page">
            <h2 className="report-section-title text-2xl">4. もっと推していこう！（{promoteItems.length}品）</h2>
            <p className="text-base text-gray-700 mb-5 leading-relaxed print:text-[10pt] print:mb-3">
              利益率がいいのにまだあんまり出てない商品。おすすめに入れたりSNSで紹介したら化けるかも。
            </p>
            <div className="space-y-4 print:space-y-3">
              {promoteItems.map(item => (
                <PromoteCard key={item.product_id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* ===== SECTION: カクテル価格帯分析 ===== */}
        <div className="report-page">
          <h2 className="report-section-title text-2xl">おまけ: カクテル、値段で売れ方が全然違う</h2>
          <p className="text-base text-gray-700 mb-5 leading-relaxed print:text-[10pt] print:mb-3">
            ¥800のカクテルはほぼ全部売れてるのに、¥1,000超えると8割が売れ残り。
            メニューの見せ方を変えるだけでだいぶ変わりそう。
          </p>
          <table className="w-full border-collapse text-base print:text-[9pt]">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="border border-gray-300 px-5 py-3 text-left font-bold">価格帯</th>
                <th className="border border-gray-300 px-5 py-3 text-right font-bold">全部</th>
                <th className="border border-gray-300 px-5 py-3 text-right font-bold">売れてる</th>
                <th className="border border-gray-300 px-5 py-3 text-right font-bold">売れてない</th>
                <th className="border border-gray-300 px-5 py-3 text-right font-bold">売れ残り率</th>
              </tr>
            </thead>
            <tbody>
              {[800, 850, 900, 1000, 1100].map(price => {
                const cocktails = products.filter(p => p.category_name === "カクテル" && p.price === price && p.display_flag === "1");
                const withSales = cocktails.filter(p => salesMap.has(p.product_id));
                const deadCount = cocktails.length - withSales.length;
                const rate = cocktails.length > 0 ? Math.round((deadCount / cocktails.length) * 100) : 0;
                const isHigh = rate >= 50;
                return (
                  <tr key={price} className={isHigh ? "bg-red-50 print:bg-red-50" : ""}>
                    <td className="border border-gray-300 px-5 py-3 font-medium">{YEN(price)}</td>
                    <td className="border border-gray-300 px-5 py-3 text-right tabular-nums">{cocktails.length}</td>
                    <td className="border border-gray-300 px-5 py-3 text-right tabular-nums">{withSales.length}</td>
                    <td className="border border-gray-300 px-5 py-3 text-right tabular-nums font-bold">{deadCount}</td>
                    <td className={`border border-gray-300 px-5 py-3 text-right tabular-nums font-bold ${isHigh ? "text-red-600 print:text-red-700" : ""}`}>{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-base leading-relaxed print:rounded-none print:text-[10pt]">
            <strong>やりたいこと:</strong> モヒートとかテキーラサンライズとか定番の¥1,000帯をメニューの目立つところに。マニアック系は裏メニュー化もアリ。
          </div>
        </div>

        {/* ===== SECTION: 署名 ===== */}
        <div className="report-page">
          <h2 className="report-section-title text-2xl">決まったこと・やること</h2>
          <div className="space-y-8 mt-6 print:space-y-5 print:mt-4">
            <SignatureLine label="日付" placeholder="　　　　年　　　月　　　日" />
            <SignatureLine label="参加メンバー" />
            <div>
              <div className="text-base font-semibold mb-2 print:text-[11pt]">今週やること:</div>
              <div className="border border-gray-400 rounded-sm min-h-[100px] p-3 print:min-h-[50pt] print:rounded-none">&nbsp;</div>
            </div>
            <div>
              <div className="text-base font-semibold mb-2 print:text-[11pt]">今月中にやること:</div>
              <div className="border border-gray-400 rounded-sm min-h-[100px] p-3 print:min-h-[50pt] print:rounded-none">&nbsp;</div>
            </div>
            <div>
              <div className="text-base font-semibold mb-2 print:text-[11pt]">その他メモ・アイデア:</div>
              <div className="border border-gray-400 rounded-sm min-h-[100px] p-3 print:min-h-[50pt] print:rounded-none">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Components ──

function SummaryBox({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight: "blue" | "red" | "amber" | "emerald" }) {
  const colors = {
    blue: "border-blue-300 bg-blue-50/50 print:bg-blue-50",
    red: "border-red-300 bg-red-50/50 print:bg-red-50",
    amber: "border-amber-300 bg-amber-50/50 print:bg-amber-50",
    emerald: "border-emerald-300 bg-emerald-50/50 print:bg-emerald-50",
  };
  return (
    <div className={`border-2 rounded-lg p-5 text-center print:p-3 print:rounded-none ${colors[highlight]}`}>
      <div className="text-sm font-semibold text-gray-600 tracking-wide print:text-[9pt]">{label}</div>
      <div className="mt-2 text-4xl font-black tabular-nums print:text-[18pt]">{value}</div>
      <div className="mt-1 text-sm text-gray-500 print:text-[8pt]">{sub}</div>
    </div>
  );
}

function DataField({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <div className="text-base text-gray-500 print:text-[9pt] print:text-gray-600">{label}</div>
      <div className={`text-2xl font-black tabular-nums print:text-[13pt] ${warn ? "text-red-600 print:text-black print:underline" : ""}`}>{value}</div>
    </div>
  );
}

function PriceCard({ item }: { item: MenuAnalysisItem }) {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 print:rounded-none print:p-4">
      {/* 商品名と値段 */}
      <div className="text-2xl font-bold print:text-[16pt]">{item.product_name}</div>
      <div className="mt-1 flex items-center gap-3">
        <span className="text-base text-gray-500 print:text-[10pt]">{item.category_name}</span>
        <span className="text-2xl font-black tabular-nums print:text-[16pt]">{YEN(item.selling_price)}</span>
      </div>

      {/* 数字 */}
      <div className="grid grid-cols-2 gap-4 mt-5 p-4 bg-gray-50 rounded-lg print:bg-gray-100 print:rounded-none print:p-3">
        <DataField label="原価" value={item.estimated_cost !== null ? YEN(item.estimated_cost) : "—"} />
        <DataField label="原価率" value={PCT(item.cost_ratio)} warn={item.cost_ratio !== null && item.cost_ratio > 0.35} />
        <DataField label="90日の売上" value={YEN(item.total_sales)} />
        <DataField label="90日で何個" value={`${NUM(item.total_quantity)}個`} />
      </div>

      {/* 判断 */}
      <div className="mt-5 pt-4 border-t border-gray-100 print:mt-3 print:pt-2">
        <div className="flex gap-8 text-lg font-medium print:text-[11pt]">
          <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> 値上げする</label>
          <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> このまま</label>
          <label className="flex items-center gap-2"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> 保留</label>
        </div>
        <div className="mt-4 flex items-end gap-3">
          <span className="text-lg font-semibold whitespace-nowrap print:text-[12pt]">新しい値段:</span>
          <span className="flex-1 border-b-2 border-gray-400 pb-1 text-center text-2xl font-bold print:text-[14pt]">¥</span>
        </div>
      </div>
    </div>
  );
}

function PromoteCard({ item }: { item: MenuAnalysisItem }) {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 print:rounded-none print:p-4">
      <div className="text-2xl font-bold print:text-[16pt]">{item.product_name}</div>
      <div className="mt-1 flex items-center gap-3">
        <span className="text-base text-gray-500 print:text-[10pt]">{item.category_name}</span>
        <span className="text-2xl font-black tabular-nums print:text-[16pt]">{YEN(item.selling_price)}</span>
        <span className="text-base text-gray-400 print:text-[9pt]">（原価率 {PCT(item.cost_ratio)}）</span>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-lg print:text-[11pt] print:mt-3 print:pt-2">
        <label className="flex items-center gap-2 font-medium"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> おすすめに追加</label>
        <label className="flex items-center gap-2 font-medium"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> メニュー目立たせる</label>
        <label className="flex items-center gap-2 font-medium"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> SNSで紹介</label>
        <label className="flex items-center gap-2 font-medium"><span className="inline-block w-5 h-5 border-2 border-gray-400 rounded print:w-4 print:h-4" /> スタッフから推す</label>
      </div>
      <div className="mt-4">
        <span className="text-base text-gray-500 print:text-[9pt]">メモ:</span>
        <div className="border-b-2 border-dotted border-gray-300 min-h-[28px] mt-1 print:min-h-[14pt]" />
      </div>
    </div>
  );
}

function AgendaRow({ num, title, time, desc }: { num: string; title: string; time: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 px-6 py-3.5 print:py-2.5">
      <span className="flex-none w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-base font-bold print:bg-black print:text-[11pt]">{num}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-bold print:text-[12pt]">{title}</span>
          <span className="text-sm text-gray-400 tabular-nums print:text-[9pt]">{time}</span>
        </div>
        <div className="text-base text-gray-600 mt-0.5 print:text-[10pt]">{desc}</div>
      </div>
    </div>
  );
}

function SignatureLine({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div className="flex items-end gap-4">
      <span className="text-base font-semibold whitespace-nowrap print:text-[11pt]">{label}:</span>
      <span className="flex-1 border-b-2 border-gray-400 pb-1 text-base print:text-[11pt]">{placeholder ?? "\u00A0"}</span>
    </div>
  );
}

// ── Print CSS ──
const printStyles = `
@media print {
  [data-slot="sidebar"], [data-sidebar="sidebar"], nav[aria-label="パンくずリスト"], [data-slot="mobile-nav"], .print\\:hidden { display: none !important; }
  body { background: white !important; color: black !important; font-size: 13pt !important; line-height: 1.7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  main { background: white !important; padding: 0 !important; overflow: visible !important; }
  @page { size: A4 portrait; margin: 18mm 15mm; }
  .report-root { max-width: none !important; padding: 0 !important; }
  .report-page { page-break-before: always; padding-top: 0; }
  .report-page:first-of-type { page-break-before: auto; }
  .report-section-title { font-size: 19pt !important; font-weight: 800 !important; color: black !important; border-bottom: 2pt solid black !important; padding-bottom: 6pt !important; margin-bottom: 14pt !important; }
  .report-card { page-break-inside: avoid; break-inside: avoid; }
  * { box-shadow: none !important; }
  .report-header { border-bottom-width: 2pt !important; border-color: black !important; }
  .report-header h1 { font-size: 22pt !important; letter-spacing: 0.15em !important; }
  .report-header h2 { font-size: 16pt !important; }
}
`;
