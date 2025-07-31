import { twMerge } from "tailwind-merge";

const Tr = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <tr className={twMerge("border-b border-gray-700", className)}>
      {children}
    </tr>
  );
};

export default Tr;
