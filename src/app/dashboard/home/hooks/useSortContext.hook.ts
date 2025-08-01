"use client";

import { useContext } from "react";
import SortContext, { SortContextType } from "../contexts/SortContext";

export const useSortContext = (): SortContextType => {
  const context = useContext(SortContext);
  if (context === undefined) {
    throw new Error("useSortContext must be used within a SortProvider");
  }
  return context;
};
