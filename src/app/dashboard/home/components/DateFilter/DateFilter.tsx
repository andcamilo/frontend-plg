import { useSortContext } from "../../hooks/useSortContext.hook";
import { DateFilter as DateFilterType } from "../../contexts/SortContext";

const DateFilter = () => {
  const { filterState, setFilterState } = useSortContext();

  const handleDateFilterChange = (value: DateFilterType) => {
    setFilterState((prev) => ({
      ...prev,
      dateFilter: value,
    }));
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <label className="text-sm font-medium text-gray-300">
        Filtrar por fecha:
      </label>
      <select
        value={filterState.dateFilter}
        onChange={(e) =>
          handleDateFilterChange(e.target.value as DateFilterType)
        }
        className="px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Todas las solicitudes</option>
        <option value="last_month">Último mes</option>
        <option value="last_year">Último año</option>
      </select>
    </div>
  );
};

export default DateFilter;
