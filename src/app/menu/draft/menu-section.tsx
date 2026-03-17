import { formatYen } from "@/lib/format";
import type { DraftItem, DraftSection, DraftStatus } from "./types";

// ── Menu Section — Looks like a real restaurant menu ──

export function MenuSection({
  section,
  mode,
}: {
  section: DraftSection;
  mode: "before" | "after";
}) {
  // Split items into 2 columns for density
  const items = mode === "after"
    ? section.items // show all in after (including removed with strikethrough)
    : section.items;

  const mid = Math.ceil(items.length / 2);
  const col1 = items.slice(0, mid);
  const col2 = items.slice(mid);

  return (
    <div className="menu-section-card">
      {/* Section header — like a real menu category */}
      <div className="menu-section-header">
        <div className="menu-section-header-line" />
        <h3 className="menu-section-header-title">
          {section.label}
        </h3>
        <div className="menu-section-header-line" />
      </div>

      {/* Items in 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 px-4 pb-4 print:grid-cols-2 print:gap-x-6 print:px-3 print:pb-3">
        <div>
          {col1.map((item) => (
            <MenuItem key={item.product_id} item={item} mode={mode} />
          ))}
        </div>
        <div>
          {col2.map((item) => (
            <MenuItem key={item.product_id} item={item} mode={mode} />
          ))}
        </div>
      </div>

      {/* Item count footer */}
      <div className="border-t px-4 py-1.5 text-[10px] text-muted-foreground text-right print:px-3 print:text-[7pt] print:text-gray-500 print:border-gray-300">
        {mode === "after" ? (
          <>
            {items.filter(i => i.status !== "dead_stock").length}品
            {items.filter(i => i.status === "dead_stock").length > 0 && (
              <span className="text-red-500 ml-1 print:text-red-600">
                （-{items.filter(i => i.status === "dead_stock").length}品）
              </span>
            )}
          </>
        ) : (
          <>{items.length}品</>
        )}
      </div>
    </div>
  );
}

// ── Menu Item — Elegant restaurant menu style ──

function MenuItem({
  item,
  mode,
}: {
  item: DraftItem;
  mode: "before" | "after";
}) {
  if (mode === "before") {
    return <BeforeMenuItem item={item} />;
  }
  return <AfterMenuItem item={item} />;
}

function BeforeMenuItem({ item }: { item: DraftItem }) {
  const changed = item.has_changes;
  return (
    <div className={`menu-item group ${changed ? "bg-amber-50/40 dark:bg-amber-500/5 -mx-1 px-1 rounded print:bg-yellow-50/50" : ""}`}>
      <span className="menu-item-name">{item.product_name}</span>
      <span className="menu-item-dots" />
      <span className="menu-item-price">{formatYen(item.price)}</span>
    </div>
  );
}

function AfterMenuItem({ item }: { item: DraftItem }) {
  const s = item.status;

  // Dead stock items (only these are flagged for removal)
  if (s === "dead_stock") {
    return (
      <div className="menu-item opacity-50">
        <span className="menu-item-name line-through decoration-2">
          {item.product_name}
        </span>
        <span className="flex-1" />
        <StatusTag status={s} />
      </div>
    );
  }

  // Items with changes
  if (s === "review_price" || s === "reduce_cost" || s === "promote") {
    const borderColor = {
      review_price: "border-l-amber-400",
      reduce_cost: "border-l-orange-400",
      promote: "border-l-blue-400",
    }[s];

    return (
      <div className={`menu-item border-l-[3px] ${borderColor} -ml-1 pl-2 print:pl-1.5`}>
        <span className="menu-item-name">{item.product_name}</span>
        <span className="menu-item-dots" />
        <span className="menu-item-price">{formatYen(item.price)}</span>
        <StatusTag status={s} />
      </div>
    );
  }

  // Unchanged items
  return (
    <div className="menu-item">
      <span className="menu-item-name">{item.product_name}</span>
      <span className="menu-item-dots" />
      <span className="menu-item-price">{formatYen(item.price)}</span>
    </div>
  );
}

// ── Status Tag — compact inline badge ──

function StatusTag({ status }: { status: DraftStatus }) {
  const config: Record<string, { label: string; cls: string }> = {
    dead_stock: { label: "廃止", cls: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10 print:text-red-700 print:bg-red-50" },
    review_price: { label: "価格↑", cls: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10 print:text-amber-700 print:bg-amber-50" },
    reduce_cost: { label: "原価↓", cls: "text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10 print:text-orange-700 print:bg-orange-50" },
    promote: { label: "★推奨", cls: "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 print:text-blue-700 print:bg-blue-50" },
  };
  const c = config[status];
  if (!c) return null;

  return (
    <span className={`ml-1.5 shrink-0 rounded px-1 py-px text-[9px] font-bold leading-tight print:text-[6pt] ${c.cls}`}>
      {c.label}
    </span>
  );
}
