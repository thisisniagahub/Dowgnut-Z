"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Filter } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

interface SearchResult {
  donut: Donut;
  matchType: "name" | "type" | "tag";
  highlightedName: string;
}

export function SearchBar() {
  const search = useShop((s) => s.search);
  const setSearch = useShop((s) => s.setSearch);
  const donuts = useShop((s) => s.donuts);
  const filterType = useShop((s) => s.filterType);
  const setFilterType = useShop((s) => s.setFilterType);
  const setView = useShop((s) => s.setView);

  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Build search results
  const buildResults = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const lowerQuery = query.toLowerCase().trim();
      const matches: SearchResult[] = [];

      for (const donut of donuts) {
        // Skip if type filter doesn't match
        if (filterType && donut.type !== filterType) continue;

        // Search in name
        if (donut.name.toLowerCase().includes(lowerQuery)) {
          const index = donut.name.toLowerCase().indexOf(lowerQuery);
          const highlighted = 
            donut.name.slice(0, index) +
            `<mark>${donut.name.slice(index, index + lowerQuery.length)}</mark>` +
            donut.name.slice(index + lowerQuery.length);
          
          matches.push({
            donut,
            matchType: "name",
            highlightedName: highlighted,
          });
          continue;
        }

        // Search in type
        if (donut.type.toLowerCase().includes(lowerQuery)) {
          matches.push({
            donut,
            matchType: "type",
            highlightedName: donut.name,
          });
          continue;
        }

        // Search in tags
        const tags = (donut.tags || []).map((t) => t.trim());
        for (const tag of tags) {
          if (tag.toLowerCase().includes(lowerQuery)) {
            matches.push({
              donut,
              matchType: "tag",
              highlightedName: donut.name,
            });
            break;
          }
        }
      }

      setResults(matches.slice(0, 8)); // Limit to 8 results
    },
    [donuts, filterType]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buildResults(search);
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, buildResults]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          if (selectedIndex >= 0 && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex].donut);
          }
          break;
        case "Escape":
          setShowResults(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResults, results, selectedIndex]);

  const handleSelect = (donut: Donut) => {
    setSearch("");
    setShowResults(false);
    setSelectedIndex(-1);
    setView("shop");
    // Open detail modal for the donut
    import("@/store/use-shop").then(({ useShop }) => {
      useShop.getState().openDetail(donut);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setShowResults(value.trim().length > 0);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    if (search.trim().length > 0) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow click on results
    setTimeout(() => setShowResults(false), 200);
  };

  const clearSearch = () => {
    setSearch("");
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const typeLabels: Record<string, string> = {
    classic: "Classic",
    sprinkled: "Sprinkled",
    stuffed: "Stuffed",
    specialty: "Specialty",
  };

  const typeColors: Record<string, string> = {
    classic: "bg-amber-100 text-amber-800",
    sprinkled: "bg-pink-100 text-pink-800",
    stuffed: "bg-blue-100 text-blue-800",
    specialty: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4.5 text-[var(--color-dowgnut-blue-dark)]/50" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search donuts… (name, type, flavor)"
          value={search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-10 pr-10 h-11 rounded-full bg-white text-[var(--color-dowgnut-blue-dark)] placeholder-[var(--color-dowgnut-blue-dark)]/40 focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)]"
          autoComplete="off"
          aria-label="Search donuts"
          aria-expanded={showResults}
          aria-controls="search-results"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50 hover:text-[var(--color-dowgnut-blue-dark)] transition-colors"
            aria-label="Clear search"
          >
            <X className="size-4.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            id="search-results"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-[var(--color-dowgnut-blue-dark)]/10 bg-white shadow-xl overflow-hidden"
            ref={resultsRef}
            role="listbox"
          >
            <div className="p-2 space-y-1 max-h-96 overflow-y-auto scrollbar-dowgnut">
              {results.map((result, index) => (
                <motion.button
                  key={result.donut.id}
                  onClick={() => handleSelect(result.donut)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-[var(--color-dowgnut-lime)]/50"
                      : "hover:bg-[var(--color-dowgnut-blue-dark)]/5"
                  )}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <img
                    src={result.donut.imgUrl}
                    alt={result.donut.name}
                    className="size-12 shrink-0 rounded-xl object-contain bg-[var(--color-dowgnut-cream)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-bold text-[var(--color-dowgnut-blue-dark)]"
                      dangerouslySetInnerHTML={{ __html: result.highlightedName }}
                    />
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", typeColors[result.donut.type])}>
                        {typeLabels[result.donut.type] || result.donut.type}
                      </span>
                      <span className="text-[11px] font-bold text-[var(--color-dowgnut-blue)]">
                        RM{result.donut.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {result.matchType !== "name" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-dowgnut-pink)]/10 text-[var(--color-dowgnut-pink-dark)]">
                      {result.matchType === "type" ? "Type" : "Tag"} match
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="border-t border-[var(--color-dowgnut-blue-dark)]/10 p-2 text-center text-xs text-[var(--color-dowgnut-blue-dark)]/50">
              Press ↓↑ to navigate, Enter to select
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {["classic", "sprinkled", "stuffed", "specialty"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(filterType === type ? "" : type)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              filterType === type
                ? "bg-[var(--color-dowgnut-pink)] text-white shadow-[0_0_12px_var(--color-dowgnut-pink)]"
                : "bg-white text-[var(--color-dowgnut-blue-dark)]/70 hover:bg-[var(--color-dowgnut-lime)] hover:text-[var(--color-dowgnut-blue-dark)]"
            )}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>
    </div>
  );
}