'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { FilterSidebar } from './filter-sidebar';
import type { PropertyFilters as PropertyFiltersType } from '@/shared/types/api';

export function FilterSheet({
  filters,
  onChange,
  resultsCount,
  triggerClassName,
}: {
  filters: PropertyFiltersType;
  onChange: (next: PropertyFiltersType) => void;
  resultsCount?: number;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = Object.keys(filters).filter(
    (k) => k !== 'ordering' && filters[k as keyof PropertyFiltersType] !== undefined,
  ).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className={triggerClassName}>
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          Фильтры
          {activeCount > 0 && (
            <Badge variant="default" size="sm" shape="pill" className="ml-1 h-5 min-w-5 px-1.5">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-full sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4 px-5 pt-5">
          <SheetTitle className="font-display">Фильтры</SheetTitle>
        </SheetHeader>
        <FilterSidebar
          variant="sheet"
          filters={filters}
          onChange={onChange}
          resultsCount={resultsCount}
          onSubmit={() => setOpen(false)}
          className="flex-1"
        />
      </SheetContent>
    </Sheet>
  );
}
