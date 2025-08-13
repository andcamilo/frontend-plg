const AbogadosField = ({
  abogados,
}: {
  abogados: { id: string; nombre: string }[];
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {abogados.length < 1 ? (
        <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300">
          Sin abogado asignado
        </span>
      ) : (
        abogados.map((abogado) => (
          <span
            key={abogado.id}
            className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300"
          >
            {abogado.nombre}
          </span>
        ))
      )}
    </div>
  );
};

export default AbogadosField;
