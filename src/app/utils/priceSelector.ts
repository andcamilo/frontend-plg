export type Service = {
    name: string;
    price: number;
  };
  
  export const services: Service[] = [
    { name: "Primera vez", price: 150 },
    { name: "Aumento", price: 140 },
    { name: "Rebaja o Suspensión", price: 130 },
    { name: "Desacato", price: 100 },
  ];
  
  export const getServicePrice = (serviceName: string): number | null => {
    const service = services.find((service) => service.name === serviceName);
    return service ? service.price : null;
  };
  