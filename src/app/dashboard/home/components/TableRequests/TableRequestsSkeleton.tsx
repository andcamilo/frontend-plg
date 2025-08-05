import Table from "@/src/app/(global)/components/Table/Table";
import Thead from "@/src/app/(global)/components/Table/Thead";
import Tbody from "@/src/app/(global)/components/Table/Tbody";
import Th from "@/src/app/(global)/components/Table/Th";
import Td from "@/src/app/(global)/components/Table/Td";
import Tr from "@/src/app/(global)/components/Table/Tr";

const TableRequestsSkeleton = () => {
  return (
    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
      <Table>
        <Thead>
          <Th>Tipo trámite</Th>
          <Th>Fecha de creación</Th>
          <Th>Status</Th>
          <Th>ID</Th>
          <Th>Recordatorio</Th>
          <Th>Abogados</Th>
        </Thead>
        <Tbody>
          {[...Array(5)].map((_, idx) => (
            <Tr key={idx}>
              <Td>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
                </div>
              </Td>
              <Td>
                <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
              </Td>
              <Td>
                <span className="h-6 w-16 bg-gray-700 rounded-full inline-block animate-pulse" />
              </Td>
              <Td>
                <div className="h-4 w-12 bg-gray-700 rounded animate-pulse" />
              </Td>
              <Td>
                <div className="h-8 w-8 bg-gray-700 rounded-full mx-auto animate-pulse" />
              </Td>
              <Td>
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

export default TableRequestsSkeleton;
