const Th   = ({ children }: { children: React.ReactNode }) => {
  return (
    <th className="px-4 py-3 text-left border-b border-gray-700 font-medium">
      {children}
    </th>
  );
};

export default Th;
