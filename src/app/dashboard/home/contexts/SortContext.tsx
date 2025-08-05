"use client";

import React, { createContext, useState, ReactNode } from "react";

export type SortOrder = "asc" | "desc" | null;
export type SortField = "reminder" | "date" | null;

export interface SortState {
  field: SortField;
  order: SortOrder;
}

export type DateFilter = "all" | "last_month" | "last_year";

export interface FilterState {
  dateFilter: DateFilter;
}

export interface SortContextType {
  sortState: SortState;
  setSortState: React.Dispatch<React.SetStateAction<SortState>>;
  toggleSort: (field: SortField) => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
}

const initialSortState: SortState = {
  field: null,
  order: null,
};

const initialFilterState: FilterState = {
  dateFilter: "all",
};

const SortContext = createContext<SortContextType | undefined>(undefined);

export const SortProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sortState, setSortState] = useState<SortState>(initialSortState);
  const [filterState, setFilterState] =
    useState<FilterState>(initialFilterState);

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
    <SortContext.Provider
      value={{
        sortState,
        setSortState,
        toggleSort,
        filterState,
        setFilterState,
      }}
    >
      {children}
    </SortContext.Provider>
  );
};

export default SortContext;
