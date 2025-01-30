export type Service = {
    name: string;
    price: number;
  };
  
  export const services: Service[] = [
    { name: "Primera vez", price: 650 },
    { name: "Aumento", price: 600 },
    { name: "Rebaja o Suspensión", price: 600 },
    { name: "Desacato", price: 600 },
  ];
  
  export const getServicePrice = (
    serviceName: string,
    wantsInvestigation: string
  ): number => {
    const service = services.find((service) => service.name === serviceName);
  
    if (!service) {
      return 0;
    }
  
    let totalPrice = service.price;
  
    if (wantsInvestigation === "Si") {
      totalPrice += 120;
    }
  
    return totalPrice;
  };
  
  