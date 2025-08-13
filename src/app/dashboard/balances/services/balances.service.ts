import { backendBaseUrl, backendEnv } from "@/src/app/utils/env";

export const getBalance = async (cuenta: string) => {
  return {
    paidRequests: mockPaidRequests,
    pendingRequests: mockPendingRequests,
    totalPaid: 10000,
    totalPending: 10000,
  };
};

const mockPaidRequests = [
  {
    id: "1",
    title: "Desarrollo Web Corporativo",
    amount: 2500.0,
    date: "2024-01-15",
    client: "Empresa ABC",
  },
  {
    id: "2",
    title: "Consultoría IT",
    amount: 1200.0,
    date: "2024-01-10",
    client: "StartupXYZ",
  },
  {
    id: "3",
    title: "Mantenimiento Sistema",
    amount: 800.0,
    date: "2024-01-08",
    client: "TechCorp",
  },
];

const mockPendingRequests = [
  {
    id: "4",
    title: "Diseño UX/UI",
    amount: 1800.0,
    date: "2024-01-20",
    client: "Creative Agency",
  },
  {
    id: "5",
    title: "Integración API",
    amount: 950.0,
    date: "2024-01-18",
    client: "FinTech Solutions",
  },
];
