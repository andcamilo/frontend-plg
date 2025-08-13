"use client";
import { useBalance } from "../../hooks/useBalance.query";
import RequestsOverview from "./RequestsOverview";
import RequestsOverviewSkeleton from "./RequestsOverviewSkeleton";

const RequestsOverviewContainer = () => {
  const { data: balance, isLoading, isError } = useBalance();
  if (isLoading) return <RequestsOverviewSkeleton />;
  if (isError) return <div>Error al cargar el balance</div>;
  return (
    <>
      <RequestsOverview
        paidRequests={balance?.paidRequests || []}
        pendingRequests={balance?.pendingRequests || []}
      />
    </>
  );
};

export default RequestsOverviewContainer;
