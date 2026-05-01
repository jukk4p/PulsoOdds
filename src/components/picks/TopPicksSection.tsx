"use client";

import { useState } from "react";
import { MatchGroup } from "@/components/ui/MatchGroup";
import { AnalysisDrawer } from "./AnalysisDrawer";

interface TopPicksSectionProps {
  groupedRecentPicks: any[][];
}

export function TopPicksSection({ groupedRecentPicks }: TopPicksSectionProps) {
  const [analysisPick, setAnalysisPick] = useState<any | null>(null);

  return (
    <>
      <div className="space-y-4">
        {groupedRecentPicks.length > 0 ? (
          groupedRecentPicks.map((matchPicks, idx) => (
            <MatchGroup 
              key={idx} 
              picks={matchPicks} 
              onOpenAnalysis={(pick) => setAnalysisPick(pick)}
            />
          ))
        ) : (
          <div className="py-20 text-center border border-dashed border-border-base rounded-xl">
            <p className="text-text-muted font-bold uppercase tracking-widest text-xs">No hay top picks disponibles ahora</p>
          </div>
        )}
      </div>

      <AnalysisDrawer 
        picks={analysisPick ? (Array.isArray(analysisPick) ? analysisPick : [analysisPick]) : null}
        isOpen={!!analysisPick}
        onClose={() => setAnalysisPick(null)}
      />
    </>
  );
}
