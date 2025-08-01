import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

export function getSortIcon(sortState: any) {
  if (sortState.field !== "reminder") {
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
