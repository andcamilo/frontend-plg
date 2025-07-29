const Table = ({ children }: { children: React.ReactNode }) => {
  return (
    <table className="w-full border-separate border-spacing-0">
      {children}
    </table>
  );
};

export default Table;
