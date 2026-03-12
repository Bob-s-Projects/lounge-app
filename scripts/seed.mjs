/**
 * seed.mjs - JSON データを Supabase に一括投入するスクリプト
 *
 * Usage: node scripts/seed.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── Supabase 接続 ─────────────────────────────
const SUPABASE_URL = "https://obtfuazuffsvhlngemec.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idGZ1YXp1ZmZzdmhsbmdlbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMwNjAxNywiZXhwIjoyMDg4ODgyMDE3fQ.GazG6JyyS2wbZMJVNeogSX1H1VXkBm_UIVJLZUB6MH0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── ヘルパー ──────────────────────────────────
function loadJSON(relPath) {
  return JSON.parse(readFileSync(join(root, relPath), "utf-8"));
}

/** 配列を指定サイズのチャンクに分割 */
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** upsert をチャンクで実行し、挿入行数を返す */
async function batchUpsert(table, rows, opts = {}) {
  const { chunkSize = 100, onConflict } = opts;
  let total = 0;
  const chunks = chunk(rows, chunkSize);

  for (let i = 0; i < chunks.length; i++) {
    const q = supabase.from(table).upsert(chunks[i], {
      onConflict,
      ignoreDuplicates: false,
    });
    const { data, error } = await q.select();
    if (error) {
      console.error(`  [ERROR] ${table} chunk ${i + 1}: ${error.message}`);
      throw error;
    }
    total += data.length;
    process.stdout.write(`  ${table}: ${total}/${rows.length}\r`);
  }
  console.log(`  ${table}: ${total}/${rows.length} 件 upsert 完了`);
  return total;
}

// ── 1. products ─────────────────────────────────
async function seedProducts() {
  console.log("\n[1/4] products ...");
  const src = loadJSON("src/data/products.json");
  const rows = src.products.map((p) => ({
    smaregi_product_id: p.product_id,
    product_code: p.product_code,
    name: p.product_name,
    category: p.category_name,
    price: p.price,
    cost: p.cost,
    is_active: p.display_flag === "1",
    description: p.description || null,
  }));
  await batchUpsert("products", rows, {
    chunkSize: 100,
    onConflict: "smaregi_product_id",
  });
}

// ── 2. suppliers ────────────────────────────────
async function seedSupplier() {
  console.log("\n[2/4] suppliers ...");

  // name にユニーク制約がないので、既存を検索してなければ insert
  const { data: existing } = await supabase
    .from("suppliers")
    .select("id")
    .eq("name", "酒販業者")
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`  suppliers: 既存レコード使用 (id=${existing[0].id})`);
    return existing[0].id;
  }

  const { data: inserted, error } = await supabase
    .from("suppliers")
    .insert({ name: "酒販業者" })
    .select()
    .single();
  if (error) throw error;
  console.log(`  suppliers: 1 件 insert 完了 (id=${inserted.id})`);
  return inserted.id;
}

// ── 3. supplier_items ───────────────────────────
async function seedSupplierItems(supplierId) {
  console.log("\n[3/4] supplier_items ...");
  const src = loadJSON("src/data/supplier_prices.json");

  const rows = src.items.map((item) => ({
    supplier_id: supplierId,
    supplier_code: item.supplier_code,
    name: item.product_name,
    category: item.category_name,
    spec: item.spec || null,
    case_quantity: item.case_quantity,
    unit_price: item.unit_price,
    last_shipped: item.last_shipped
      ? item.last_shipped.replace(/\//g, "-")
      : null,
  }));

  await batchUpsert("supplier_items", rows, { chunkSize: 100 });
}

// ── 4. sales_daily ──────────────────────────────
async function seedSalesDaily() {
  console.log("\n[4/4] sales_daily ...");
  const src = loadJSON("src/data/sales_summary.json");
  const periodStart = src.period.from; // "2025-12-12"

  // products テーブルから smaregi_product_id → id のマップを取得
  const { data: products, error } = await supabase
    .from("products")
    .select("id, smaregi_product_id");
  if (error) throw error;

  const productMap = new Map();
  for (const p of products) {
    if (p.smaregi_product_id) {
      productMap.set(p.smaregi_product_id, p.id);
    }
  }

  const rows = src.products.map((s) => ({
    date: periodStart,
    product_id: productMap.get(s.product_id) || null,
    smaregi_product_id: s.product_id,
    product_name: s.product_name,
    category: s.category_name,
    quantity: s.total_quantity,
    total_sales: s.total_sales,
    avg_price: s.avg_price,
  }));

  const matched = rows.filter((r) => r.product_id !== null).length;
  console.log(
    `  product_id マッチ: ${matched}/${rows.length} (${rows.length - matched} 件未マッチ)`
  );

  await batchUpsert("sales_daily", rows, { chunkSize: 100 });
}

// ── 検証 ─────────────────────────────────────────
async function verifyCounts() {
  console.log("\n=== 検証: テーブル件数 ===");
  const tables = ["products", "suppliers", "supplier_items", "sales_daily"];
  for (const t of tables) {
    const { count, error } = await supabase
      .from(t)
      .select("*", { count: "exact", head: true });
    if (error) {
      console.log(`  ${t}: ERROR - ${error.message}`);
    } else {
      console.log(`  ${t}: ${count} 件`);
    }
  }
}

// ── メイン ────────────────────────────────────────
async function main() {
  console.log("=== Seed 開始 ===");
  console.log(`Supabase: ${SUPABASE_URL}`);

  await seedProducts();
  const supplierId = await seedSupplier();
  await seedSupplierItems(supplierId);
  await seedSalesDaily();
  await verifyCounts();

  console.log("\n=== Seed 完了 ===");
}

main().catch((err) => {
  console.error("\n[FATAL]", err);
  process.exit(1);
});
