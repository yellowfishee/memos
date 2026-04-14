import { useMemo } from "react";
import { matchPath } from "react-router-dom";
import OverflowTip from "@/components/kit/OverflowTip";
import { useTagCounts } from "@/hooks/useUserQueries";
import { Routes } from "@/router";
import type { TagSuggestionsProps } from "../types";
import { SuggestionsPopup } from "./SuggestionsPopup";
import { useSuggestions } from "./useSuggestions";

export default function TagSuggestions({ editorRef, editorActions }: TagSuggestionsProps) {
  const isExplorePage = Boolean(matchPath(Routes.EXPLORE, window.location.pathname));
  const { data: tagCount = {} } = useTagCounts(!isExplorePage);

  const tagItems = useMemo(() => {
    const allTags = Object.keys(tagCount).sort((a, b) => a.localeCompare(b));
    return allTags.map((tag) => {
      const lastSlash = tag.lastIndexOf("/");
      return {
        fullTag: tag,
        display: lastSlash >= 0 ? tag.slice(lastSlash + 1) : tag,
        prefix: lastSlash >= 0 ? tag.slice(0, lastSlash + 1) : "",
      };
    });
  }, [tagCount]);

  const { position, suggestions, selectedIndex, isVisible, handleItemSelect } = useSuggestions({
    editorRef,
    editorActions,
    triggerChar: "#",
    items: tagItems,
    filterItems: (items, query) => {
      if (!query) return items;
      const lowerQuery = query.toLowerCase();
      const slashIndex = query.lastIndexOf("/");
      if (slashIndex >= 0) {
        const prefix = query.slice(0, slashIndex + 1).toLowerCase();
        const suffix = query.slice(slashIndex + 1).toLowerCase();
        return items.filter(
          (item) => item.fullTag.toLowerCase().startsWith(prefix) && (suffix === "" || item.display.toLowerCase().includes(suffix)),
        );
      }
      return items.filter((item) => item.fullTag.toLowerCase().includes(lowerQuery));
    },
    onAutocomplete: (item, word, index, actions) => {
      actions.removeText(index, word.length);
      actions.insertText(`#${item.fullTag} `);
    },
  });

  if (!isVisible || !position) return null;

  return (
    <SuggestionsPopup
      position={position}
      suggestions={suggestions}
      selectedIndex={selectedIndex}
      onItemSelect={handleItemSelect}
      getItemKey={(item) => item.fullTag}
      renderItem={(item) => (
        <OverflowTip>
          <span className="text-muted-foreground mr-1">#</span>
          {item.prefix && <span className="opacity-50">{item.prefix}</span>}
          {item.display}
        </OverflowTip>
      )}
    />
  );
}
