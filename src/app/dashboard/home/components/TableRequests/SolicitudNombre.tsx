const SolicitudNombre = ({ nombre }: { nombre: string }) => {
  return (
    <>
      <div className="text-gray-400 text-xs">
        <div className="text-gray-400 text-xs">{nombre || "-"}</div>
      </div>
    </>
  );
};

export default SolicitudNombre;
