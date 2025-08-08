"use client";
import BalanceCard from "./BalanceCard";
import BalanceCardSkeleton from "./BalanceCardSkeleton";
import { useBalance } from "../../hooks/useBalance.query";

const BalanceCardContainer = () => {
  const { data: balance, isLoading, isError } = useBalance();
  if (isLoading) return <BalanceCardSkeleton />;
  if (isError) return <div>Error al cargar el balance</div>;

  return (
    <>
      <BalanceCard balance={balance?.totalPaid || 0} />
    </>
  );
};

export default BalanceCardContainer;
