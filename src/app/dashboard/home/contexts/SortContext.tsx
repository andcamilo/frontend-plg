"use client";

import React, { createContext, useState, ReactNode } from "react";

export type SortOrder = "asc" | "desc" | null;
export type SortField = "reminder" | null;

export interface SortState {
  field: SortField;
  order: SortOrder;
}

export interface SortContextType {
  sortState: SortState;
  setSortState: React.Dispatch<React.SetStateAction<SortState>>;
  toggleSort: (field: SortField) => void;
}

const initialSortState: SortState = {
  field: null,
  order: null,
};

const SortContext = createContext<SortContextType | undefined>(undefined);

export const SortProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sortState, setSortState] = useState<SortState>(initialSortState);

  const toggleSort = (field: SortField) => {
    setSortState((prevState) => {
      if (prevState.field !== field) {
        // Si es un campo diferente, empezar con ascendente
        return { field, order: "asc" };
      } else {
        // Si es el mismo campo, cambiar el orden
        if (prevState.order === "asc") {
          return { field, order: "desc" };
        } else if (prevState.order === "desc") {
          return { field: null, order: null };
        } else {
          return { field, order: "asc" };
        }
      }
    });
  };

  return (
    <SortContext.Provider value={{ sortState, setSortState, toggleSort }}>
      {children}
    </SortContext.Provider>
  );
};

export default SortContext;
