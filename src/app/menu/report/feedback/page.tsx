"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import { formatYen } from "@/lib/format";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Save,
  Download,
  Check,
  ArrowLeft,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────

type RemoveDecision = "remove" | "keep" | "hold" | "";
type PriceDecision = "revise" | "maintain" | "hold" | "";
type PromoteAction = "display" | "recommend" | "sns" | "other";

type RemoveFeedback = {
  product_id: string;
  product_name: string;
  decision: RemoveDecision;
  effective_date: string;
  keep_reason: string;
  memo: string;
};

type PriceFeedback = {
  product_id: string;
  product_name: string;
  current_price: number;
  decision: PriceDecision;
  new_price: string;
  scheduled_date: string;
  memo: string;
};

type PromoteFeedback = {
  product_id: string;
  product_name: string;
  actions: PromoteAction[];
  memo: string;
};

type FeedbackData = {
  date: string;
  decisions: {
    remove: RemoveFeedback[];
    price: PriceFeedback[];
    promote: PromoteFeedback[];
  };
};

const STORAGE_KEY = "ledian-menu-feedback";

// ── Page Component ──────────────────────────────────────────────

export default function FeedbackPage() {
  const result = useMemo(
    () =>
      analyzeMenu(
        productsData as ProductsData,
        supplierData as SupplierData,
        salesData as SalesData,
      ),
    [],
  );

  const { items, deadStock } = result;

  // Items grouped by recommendation
  const removeItems = useMemo(
    () => [
      ...items.filter((i) => i.recommendation === "consider_remove"),
      ...deadStock.map(
        (ds) =>
          ({
            product_id: ds.product_id,
            product_name: ds.product_name,
            category_name: ds.category_name,
            selling_price: ds.selling_price,
            total_quantity: 0,
            total_sales: 0,
            transaction_count: 0,
            monthly_sales: 0,
            estimated_cost: null,
            cost_ratio: null,
            estimated_profit: null,
            monthly_profit: null,
            abc_sales: "C" as const,
            abc_quantity: "C" as const,
            abc_profit: "C" as const,
            recommendation: "consider_remove" as const,
            recommendation_reason: "90日間 販売ゼロ",
          }) satisfies MenuAnalysisItem,
      ),
    ],
    [items, deadStock],
  );

  const priceItems = useMemo(
    () =>
      items.filter(
        (i) =>
          i.recommendation === "review_price" ||
          i.recommendation === "reduce_cost",
      ),
    [items],
  );

  const promoteItems = useMemo(
    () => items.filter((i) => i.recommendation === "promote"),
    [items],
  );

  // ── State ───────────────────────────────────────────────────────

  const [removeFeedbacks, setRemoveFeedbacks] = useState<RemoveFeedback[]>(
    () =>
      removeItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        decision: "",
        effective_date: "",
        keep_reason: "",
        memo: "",
      })),
  );

  const [priceFeedbacks, setPriceFeedbacks] = useState<PriceFeedback[]>(() =>
    priceItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      current_price: item.selling_price,
      decision: "",
      new_price: "",
      scheduled_date: "",
      memo: "",
    })),
  );

  const [promoteFeedbacks, setPromoteFeedbacks] = useState<PromoteFeedback[]>(
    () =>
      promoteItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        actions: [],
        memo: "",
      })),
  );

  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data: FeedbackData = JSON.parse(raw);
      if (!data.decisions) return;

      // Merge saved data with current items
      if (data.decisions.remove) {
        setRemoveFeedbacks((prev) =>
          prev.map((fb) => {
            const saved = data.decisions.remove.find(
              (s) => s.product_id === fb.product_id,
            );
            return saved ? { ...fb, ...saved } : fb;
          }),
        );
      }
      if (data.decisions.price) {
        setPriceFeedbacks((prev) =>
          prev.map((fb) => {
            const saved = data.decisions.price.find(
              (s) => s.product_id === fb.product_id,
            );
            return saved ? { ...fb, ...saved } : fb;
          }),
        );
      }
      if (data.decisions.promote) {
        setPromoteFeedbacks((prev) =>
          prev.map((fb) => {
            const saved = data.decisions.promote.find(
              (s) => s.product_id === fb.product_id,
            );
            return saved ? { ...fb, ...saved } : fb;
          }),
        );
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────

  const updateRemove = useCallback(
    (index: number, patch: Partial<RemoveFeedback>) => {
      setRemoveFeedbacks((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
      setSaved(false);
    },
    [],
  );

  const updatePrice = useCallback(
    (index: number, patch: Partial<PriceFeedback>) => {
      setPriceFeedbacks((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
      setSaved(false);
    },
    [],
  );

  const updatePromote = useCallback(
    (index: number, patch: Partial<PromoteFeedback>) => {
      setPromoteFeedbacks((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
      setSaved(false);
    },
    [],
  );

  const togglePromoteAction = useCallback(
    (index: number, action: PromoteAction) => {
      setPromoteFeedbacks((prev) => {
        const next = [...prev];
        const current = next[index].actions;
        next[index] = {
          ...next[index],
          actions: current.includes(action)
            ? current.filter((a) => a !== action)
            : [...current, action],
        };
        return next;
      });
      setSaved(false);
    },
    [],
  );

  const handleSave = useCallback(() => {
    const data: FeedbackData = {
      date: new Date().toISOString(),
      decisions: {
        remove: removeFeedbacks,
        price: priceFeedbacks,
        promote: promoteFeedbacks,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [removeFeedbacks, priceFeedbacks, promoteFeedbacks]);

  const handleExportCsv = useCallback(() => {
    const rows: string[][] = [];

    // Header
    rows.push([
      "区分",
      "商品名",
      "判定",
      "現在価格",
      "新価格案",
      "実施日",
      "継続理由",
      "アクション",
      "メモ",
    ]);

    // Remove decisions
    for (const fb of removeFeedbacks) {
      if (!fb.decision) continue;
      const decisionLabel =
        fb.decision === "remove"
          ? "廃止決定"
          : fb.decision === "keep"
            ? "継続"
            : "保留";
      rows.push([
        "廃止検討",
        fb.product_name,
        decisionLabel,
        "",
        "",
        fb.effective_date,
        fb.keep_reason,
        "",
        fb.memo,
      ]);
    }

    // Price decisions
    for (const fb of priceFeedbacks) {
      if (!fb.decision) continue;
      const decisionLabel =
        fb.decision === "revise"
          ? "改定"
          : fb.decision === "maintain"
            ? "据置"
            : "保留";
      rows.push([
        "価格改定",
        fb.product_name,
        decisionLabel,
        String(fb.current_price),
        fb.new_price,
        fb.scheduled_date,
        "",
        "",
        fb.memo,
      ]);
    }

    // Promote decisions
    for (const fb of promoteFeedbacks) {
      if (fb.actions.length === 0 && !fb.memo) continue;
      const actionLabels = fb.actions
        .map((a) => PROMOTE_ACTION_LABELS[a])
        .join("/");
      rows.push([
        "強化推奨",
        fb.product_name,
        "",
        "",
        "",
        "",
        "",
        actionLabels,
        fb.memo,
      ]);
    }

    // Build CSV with BOM for Excel
    const bom = "\uFEFF";
    const csv =
      bom +
      rows
        .map((row) =>
          row
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `メニュー改廃フィードバック_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [removeFeedbacks, priceFeedbacks, promoteFeedbacks]);

  // ── Progress counters ─────────────────────────────────────────

  const removeProgress = removeFeedbacks.filter((fb) => fb.decision).length;
  const priceProgress = priceFeedbacks.filter((fb) => fb.decision).length;
  const promoteProgress = promoteFeedbacks.filter(
    (fb) => fb.actions.length > 0,
  ).length;

  return (
    <div className="space-y-6 p-6 md:p-10">
      <BreadcrumbNav />

      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardCheck className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            メニュー改廃 フィードバック入力
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            会議での決定事項を入力してください。入力内容はブラウザに自動保存されません。「保存」ボタンを押してください。
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/menu/report"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          提案書に戻る
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="default" onClick={handleExportCsv}>
            <Download className="size-3.5" data-icon="inline-start" />
            CSVダウンロード
          </Button>
          <Button onClick={handleSave}>
            {saved ? (
              <Check className="size-3.5" data-icon="inline-start" />
            ) : (
              <Save className="size-3.5" data-icon="inline-start" />
            )}
            {saved ? "保存しました" : "保存"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="shadow-sm rounded-xl">
        <CardContent className="pt-6">
          <Tabs defaultValue={0}>
            <TabsList className="flex-wrap bg-muted/40 p-1 rounded-lg">
              <TabsTrigger
                value={0}
                className="transition-all data-[state=active]:font-semibold"
              >
                廃止判定
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                  {removeProgress}/{removeItems.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value={1}
                className="transition-all data-[state=active]:font-semibold"
              >
                価格改定
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                  {priceProgress}/{priceItems.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value={2}
                className="transition-all data-[state=active]:font-semibold"
              >
                強化施策
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                  {promoteProgress}/{promoteItems.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Remove decisions */}
            <TabsContent value={0} className="mt-4 space-y-4">
              {removeFeedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  廃止検討対象の商品はありません
                </p>
              ) : (
                removeFeedbacks.map((fb, idx) => {
                  const sourceItem = removeItems[idx];
                  return (
                    <FeedbackCard
                      key={fb.product_id}
                      title={fb.product_name}
                      subtitle={
                        sourceItem
                          ? `${sourceItem.category_name} / ${formatYen(sourceItem.selling_price)} / 90日売上: ${formatYen(sourceItem.total_sales)}`
                          : ""
                      }
                      badge={
                        fb.decision === "remove"
                          ? "廃止決定"
                          : fb.decision === "keep"
                            ? "継続"
                            : fb.decision === "hold"
                              ? "保留"
                              : undefined
                      }
                      badgeVariant={
                        fb.decision === "remove"
                          ? "destructive"
                          : fb.decision === "keep"
                            ? "success"
                            : "secondary"
                      }
                    >
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium mb-1.5">
                            判定
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <RadioPill
                              label="廃止決定"
                              checked={fb.decision === "remove"}
                              onChange={() =>
                                updateRemove(idx, { decision: "remove" })
                              }
                              variant="destructive"
                            />
                            <RadioPill
                              label="継続"
                              checked={fb.decision === "keep"}
                              onChange={() =>
                                updateRemove(idx, { decision: "keep" })
                              }
                              variant="success"
                            />
                            <RadioPill
                              label="保留"
                              checked={fb.decision === "hold"}
                              onChange={() =>
                                updateRemove(idx, { decision: "hold" })
                              }
                              variant="secondary"
                            />
                          </div>
                        </div>
                        {fb.decision === "remove" && (
                          <div>
                            <Label
                              htmlFor={`remove-date-${idx}`}
                              className="text-xs font-medium"
                            >
                              廃止予定日
                            </Label>
                            <Input
                              id={`remove-date-${idx}`}
                              type="date"
                              value={fb.effective_date}
                              onChange={(e) =>
                                updateRemove(idx, {
                                  effective_date: e.target.value,
                                })
                              }
                              className="mt-1 w-auto"
                            />
                          </div>
                        )}
                        {fb.decision === "keep" && (
                          <div>
                            <Label
                              htmlFor={`keep-reason-${idx}`}
                              className="text-xs font-medium"
                            >
                              継続理由
                            </Label>
                            <Input
                              id={`keep-reason-${idx}`}
                              value={fb.keep_reason}
                              onChange={(e) =>
                                updateRemove(idx, {
                                  keep_reason: e.target.value,
                                })
                              }
                              placeholder="例: 常連客からの要望あり"
                              className="mt-1"
                            />
                          </div>
                        )}
                        <div>
                          <Label
                            htmlFor={`remove-memo-${idx}`}
                            className="text-xs font-medium"
                          >
                            メモ
                          </Label>
                          <Textarea
                            id={`remove-memo-${idx}`}
                            value={fb.memo}
                            onChange={(e) =>
                              updateRemove(idx, { memo: e.target.value })
                            }
                            placeholder="自由記入..."
                            className="mt-1 min-h-[2.5rem]"
                          />
                        </div>
                      </div>
                    </FeedbackCard>
                  );
                })
              )}
            </TabsContent>

            {/* Tab 2: Price decisions */}
            <TabsContent value={1} className="mt-4 space-y-4">
              {priceFeedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  価格改定検討対象の商品はありません
                </p>
              ) : (
                priceFeedbacks.map((fb, idx) => {
                  const sourceItem = priceItems[idx];
                  return (
                    <FeedbackCard
                      key={fb.product_id}
                      title={fb.product_name}
                      subtitle={
                        sourceItem
                          ? `${sourceItem.category_name} / 現在価格: ${formatYen(sourceItem.selling_price)} / 原価率: ${sourceItem.cost_ratio !== null ? `${(sourceItem.cost_ratio * 100).toFixed(1)}%` : "--"}`
                          : ""
                      }
                      badge={
                        fb.decision === "revise"
                          ? "改定"
                          : fb.decision === "maintain"
                            ? "据置"
                            : fb.decision === "hold"
                              ? "保留"
                              : undefined
                      }
                      badgeVariant={
                        fb.decision === "revise"
                          ? "primary"
                          : fb.decision === "maintain"
                            ? "success"
                            : "secondary"
                      }
                    >
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium mb-1.5">
                            判定
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <RadioPill
                              label="改定"
                              checked={fb.decision === "revise"}
                              onChange={() =>
                                updatePrice(idx, { decision: "revise" })
                              }
                              variant="primary"
                            />
                            <RadioPill
                              label="据置"
                              checked={fb.decision === "maintain"}
                              onChange={() =>
                                updatePrice(idx, { decision: "maintain" })
                              }
                              variant="success"
                            />
                            <RadioPill
                              label="保留"
                              checked={fb.decision === "hold"}
                              onChange={() =>
                                updatePrice(idx, { decision: "hold" })
                              }
                              variant="secondary"
                            />
                          </div>
                        </div>
                        {fb.decision === "revise" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <Label
                                htmlFor={`new-price-${idx}`}
                                className="text-xs font-medium"
                              >
                                新価格（税込）
                              </Label>
                              <div className="relative mt-1">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  ¥
                                </span>
                                <Input
                                  id={`new-price-${idx}`}
                                  type="number"
                                  value={fb.new_price}
                                  onChange={(e) =>
                                    updatePrice(idx, {
                                      new_price: e.target.value,
                                    })
                                  }
                                  placeholder="0"
                                  className="pl-7 tabular-nums"
                                />
                              </div>
                            </div>
                            <div>
                              <Label
                                htmlFor={`price-date-${idx}`}
                                className="text-xs font-medium"
                              >
                                実施予定日
                              </Label>
                              <Input
                                id={`price-date-${idx}`}
                                type="date"
                                value={fb.scheduled_date}
                                onChange={(e) =>
                                  updatePrice(idx, {
                                    scheduled_date: e.target.value,
                                  })
                                }
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <Label
                            htmlFor={`price-memo-${idx}`}
                            className="text-xs font-medium"
                          >
                            メモ
                          </Label>
                          <Textarea
                            id={`price-memo-${idx}`}
                            value={fb.memo}
                            onChange={(e) =>
                              updatePrice(idx, { memo: e.target.value })
                            }
                            placeholder="自由記入..."
                            className="mt-1 min-h-[2.5rem]"
                          />
                        </div>
                      </div>
                    </FeedbackCard>
                  );
                })
              )}
            </TabsContent>

            {/* Tab 3: Promote decisions */}
            <TabsContent value={2} className="mt-4 space-y-4">
              {promoteFeedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  強化推奨対象の商品はありません
                </p>
              ) : (
                promoteFeedbacks.map((fb, idx) => {
                  const sourceItem = promoteItems[idx];
                  return (
                    <FeedbackCard
                      key={fb.product_id}
                      title={fb.product_name}
                      subtitle={
                        sourceItem
                          ? `${sourceItem.category_name} / ${formatYen(sourceItem.selling_price)} / 原価率: ${sourceItem.cost_ratio !== null ? `${(sourceItem.cost_ratio * 100).toFixed(1)}%` : "--"}`
                          : ""
                      }
                      badge={
                        fb.actions.length > 0
                          ? `${fb.actions.length}件選択`
                          : undefined
                      }
                      badgeVariant="primary"
                    >
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium mb-1.5">
                            アクション
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {PROMOTE_ACTIONS.map(({ value, label }) => (
                              <CheckboxPill
                                key={value}
                                label={label}
                                checked={fb.actions.includes(value)}
                                onChange={() =>
                                  togglePromoteAction(idx, value)
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label
                            htmlFor={`promote-memo-${idx}`}
                            className="text-xs font-medium"
                          >
                            メモ
                          </Label>
                          <Textarea
                            id={`promote-memo-${idx}`}
                            value={fb.memo}
                            onChange={(e) =>
                              updatePromote(idx, { memo: e.target.value })
                            }
                            placeholder="自由記入..."
                            className="mt-1 min-h-[2.5rem]"
                          />
                        </div>
                      </div>
                    </FeedbackCard>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bottom save bar */}
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="size-3.5" data-icon="inline-start" />
          CSVダウンロード
        </Button>
        <Button onClick={handleSave}>
          {saved ? (
            <Check className="size-3.5" data-icon="inline-start" />
          ) : (
            <Save className="size-3.5" data-icon="inline-start" />
          )}
          {saved ? "保存しました" : "保存"}
        </Button>
      </div>
    </div>
  );
}

// ── Promote action constants ────────────────────────────────────

const PROMOTE_ACTIONS: { value: PromoteAction; label: string }[] = [
  { value: "display", label: "メニュー表示強化" },
  { value: "recommend", label: "おすすめ追加" },
  { value: "sns", label: "SNS告知" },
  { value: "other", label: "その他" },
];

const PROMOTE_ACTION_LABELS: Record<PromoteAction, string> = {
  display: "メニュー表示強化",
  recommend: "おすすめ追加",
  sns: "SNS告知",
  other: "その他",
};

// ── Sub-components ──────────────────────────────────────────────

function FeedbackCard({
  title,
  subtitle,
  badge,
  badgeVariant,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  badgeVariant?: "destructive" | "success" | "primary" | "secondary";
  children: React.ReactNode;
}) {
  const badgeClass =
    badgeVariant === "destructive"
      ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400"
      : badgeVariant === "success"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
        : badgeVariant === "primary"
          ? "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400"
          : "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400";

  return (
    <div className="rounded-xl border p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {badge && (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function RadioPill({
  label,
  checked,
  onChange,
  variant,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  variant: "destructive" | "success" | "primary" | "secondary";
}) {
  const baseClass =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all border";
  const checkedClass =
    variant === "destructive"
      ? "bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400/30 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/50"
      : variant === "success"
        ? "bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50"
        : variant === "primary"
          ? "bg-blue-100 text-blue-800 border-blue-300 ring-1 ring-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50"
          : "bg-gray-100 text-gray-800 border-gray-300 ring-1 ring-gray-400/30 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/50";
  const uncheckedClass =
    "bg-background text-muted-foreground border-input hover:bg-muted";

  return (
    <button
      type="button"
      className={`${baseClass} ${checked ? checkedClass : uncheckedClass}`}
      onClick={onChange}
    >
      {checked && <Check className="size-3 mr-1" />}
      {label}
    </button>
  );
}

function CheckboxPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all border ${
        checked
          ? "bg-blue-100 text-blue-800 border-blue-300 ring-1 ring-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50"
          : "bg-background text-muted-foreground border-input hover:bg-muted"
      }`}
      onClick={onChange}
    >
      {checked && <Check className="size-3 mr-1" />}
      {label}
    </button>
  );
}
