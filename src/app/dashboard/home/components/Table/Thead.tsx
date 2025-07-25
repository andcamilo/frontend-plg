const Thead = ({ children }: { children: React.ReactNode }) => {
  return (
    <thead className="text-white sticky top-0 bg-[#1F1D2B] z-10">
      <tr>{children}</tr>
    </thead>
  );
};

export default Thead;
