import Table from "./Table/Table";
import Thead from "./Table/Thead";
import Tbody from "./Table/Tbody";
import Th from "./Table/Th";
import Td from "./Table/Td";
import Tr from "./Table/Tr";

const TableRequests = () => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <Thead>
          <Th>Tipo trámite</Th>
          <Th>Fecha de creación</Th>
          <Th>Status</Th>
          <Th>ID</Th>
          <Th>Acciones</Th>
          <Th>Recordatorio</Th>
          <Th>Fecha de corte</Th>
          <Th>Abogado</Th>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <div>
                <div className="font-medium">Sociedad/Empresa</div>
                <div className="text-gray-400 text-xs">Corporación X, S.A</div>
              </div>
            </Td>
            <Td>27-05-2024</Td>
            <Td>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                Revisión Inicial
              </span>
            </Td>
            <Td>2024-0002</Td>
            <Td>
              <div className="flex gap-1">
                <button className="text-purple-400 hover:text-purple-300">
                  👁️
                </button>
                <button className="text-yellow-400 hover:text-yellow-300">
                  ✏️
                </button>
                <button className="text-green-400 hover:text-green-300">
                  ⭐
                </button>
              </div>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                1 Día
              </span>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300">
                27-05-2025
              </span>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                María I.
              </span>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <div>
                <div className="font-medium">Fundación de Interés Privado</div>
                <div className="text-gray-400 text-xs">Los Mares</div>
              </div>
            </Td>
            <Td>27-05-2024</Td>
            <Td>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                En proceso
              </span>
            </Td>
            <Td>2024-0002</Td>
            <Td>
              <div className="flex gap-1">
                <button className="text-purple-400 hover:text-purple-300">
                  👁️
                </button>
                <button className="text-yellow-400 hover:text-yellow-300">
                  ✏️
                </button>
                <button className="text-green-400 hover:text-green-300">
                  ⭐
                </button>
              </div>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                1 Día
              </span>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-300">
                27-05-2025
              </span>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                María I.
              </span>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <div>
                <div className="font-medium">Fundación de Interés Privado</div>
                <div className="text-gray-400 text-xs">ABC</div>
              </div>
            </Td>
            <Td>27-05-2024</Td>
            <Td>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                Esperando revisión externa
              </span>
            </Td>
            <Td>2024-0002</Td>
            <Td>
              <div className="flex gap-1">
                <button className="text-purple-400 hover:text-purple-300">
                  👁️
                </button>
                <button className="text-yellow-400 hover:text-yellow-300">
                  ✏️
                </button>
                <button className="text-green-400 hover:text-green-300">
                  ⭐
                </button>
              </div>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                2 Días
              </span>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">
                27-05-2025
              </span>
            </Td>
            <Td>
              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                María I.
              </span>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );
};

export default TableRequests;
