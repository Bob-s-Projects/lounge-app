"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MenuSection } from "./menu-section";
import type { DraftGroup, DraftSection } from "./types";

interface DraftTabsProps {
  groups: DraftGroup[];
}

export function DraftTabs({ groups }: DraftTabsProps) {
  const allSections = groups.flatMap((g) => g.sections);
  const tabs = [
    ...groups.map((g) => ({
      value: g.key,
      label: g.label,
      count: g.sections.reduce((sum, s) => sum + s.items.length, 0),
      sections: g.sections,
    })),
    {
      value: "all",
      label: "全カテゴリ",
      count: allSections.reduce((sum, s) => sum + s.items.length, 0),
      sections: allSections,
    },
  ];

  return (
    <div className="draft-tabs-screen print:hidden">
      <Tabs defaultValue={groups[0]?.key ?? "all"}>
        <TabsList className="flex-wrap bg-muted/40 p-1 rounded-lg">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="transition-all data-[state=active]:font-semibold data-[state=active]:shadow-sm"
            >
              {tab.label}
              <Badge
                variant="secondary"
                className="ml-1 text-[10px] px-1.5 py-0"
              >
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <BeforeAfterView sections={tab.sections} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ── Before/After side-by-side view ──

function BeforeAfterView({ sections }: { sections: DraftSection[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* BEFORE column */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-gray-200 px-3 py-1 text-sm font-bold tracking-wide dark:bg-gray-700">
            BEFORE
          </span>
          <span className="text-sm text-muted-foreground">現行メニュー</span>
        </div>
        <div className="space-y-4">
          {sections.map((section) => (
            <MenuSection key={section.key} section={section} mode="before" />
          ))}
        </div>
      </div>

      {/* AFTER column */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-indigo-100 px-3 py-1 text-sm font-bold tracking-wide text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
            AFTER
          </span>
          <span className="text-sm text-muted-foreground">提案メニュー</span>
        </div>
        <div className="space-y-4">
          {sections.map((section) => (
            <MenuSection key={section.key} section={section} mode="after" />
          ))}
        </div>
      </div>
    </div>
  );
}
