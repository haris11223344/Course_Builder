import React from "react";
import { SOURCE_OPTIONS } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Video, Globe, Github, BookOpen } from "lucide-react";

interface SourceSelectionProps {
  selectedSources: string[];
  onChange: (sources: string[]) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const SourceSelectionStep: React.FC<SourceSelectionProps> = ({
  selectedSources,
  onChange,
  onBack,
  onSubmit,
  isLoading,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case "youtube":
        return Video;
      case "web":
        return Globe;
      case "github":
        return Github;
      default:
        return BookOpen;
    }
  };

  const toggleSource = (id: string) => {
    if (selectedSources.includes(id)) {
      if (selectedSources.length === 1) return; // Keep at least one
      onChange(selectedSources.filter((s) => s !== id));
    } else {
      onChange([...selectedSources, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">Select Learning Sources</h3>
        <p className="text-xs text-muted-foreground mt-1">
          CourseForge autonomously queries these services simultaneously to gather lesson candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SOURCE_OPTIONS.map((src) => {
          const isSelected = selectedSources.includes(src.id);
          const Icon = getIcon(src.id);

          return (
            <div
              key={src.id}
              onClick={() => toggleSource(src.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                isSelected
                  ? "border-primary bg-primary/10 text-foreground glow-inner font-semibold"
                  : "border-border/80 bg-background/50 hover:bg-secondary/60 text-muted-foreground"
              }`}
            >
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-foreground">{src.label}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="accent-primary h-4 w-4 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{src.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <span>
          <strong>Autonomous Diversity Filter:</strong> At most 1 lecture from the same channel is permitted per module to guarantee balanced pedagogical exposure.
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="text-xs h-9 px-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || selectedSources.length === 0}
          className="text-xs h-10 px-6 glow-lg"
        >
          {isLoading ? (
            "Initiating Pipeline..."
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate Course Tree <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
