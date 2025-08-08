import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

import { SortState } from "../contexts/SortContext";

export function getSortIcon(sortState: SortState, field?: "reminder" | "date") {
  const targetField = field || "reminder";

  if (sortState.field !== targetField) {
    return <ArrowUpDown className="w-4 h-4 ml-1" />;
  }
  if (sortState.order === "asc") {
    return <ChevronUp className="w-4 h-4 ml-1" />;
  }
  if (sortState.order === "desc") {
    return <ChevronDown className="w-4 h-4 ml-1" />;
  }
  return <ArrowUpDown className="w-4 h-4 ml-1" />;
}
