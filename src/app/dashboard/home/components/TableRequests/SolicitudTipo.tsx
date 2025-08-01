const SolicitudTipo = ({ tipo }: { tipo: string }) => {
  return (
    <>
      <div className="font-medium">{tipo || "-"}</div>
    </>
  );
};

export default SolicitudTipo;
