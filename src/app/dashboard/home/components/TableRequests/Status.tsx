import StatusEditButton from "../Status/StatusEditButton";

const Status = ({ solicitudId, statusInfo }: { solicitudId: string, statusInfo: any }) => {
  return (
    <>
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 w-fit ${
          statusInfo.color === "red"
            ? "bg-red-500/20 text-red-400"
            : statusInfo.color === "yellow"
            ? "bg-yellow-500/20 text-yellow-400"
            : statusInfo.color === "green"
            ? "bg-green-500/20 text-green-400"
            : statusInfo.color === "blue"
            ? "bg-blue-500/20 text-blue-400"
            : statusInfo.color === "purple"
            ? "bg-purple-500/20 text-purple-400"
            : "bg-gray-500/20 text-gray-400"
        }`}
      >
        {statusInfo.label}
        <StatusEditButton solicitudId={solicitudId} />
      </span>
    </>
  );
};

export default Status;
