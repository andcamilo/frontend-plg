export type Role = {
    name: string;
    value: number;
};

export const roles: Role[] = [
    { name: "Super Admin", value: 99 },
    { name: "Administrador", value: 90 },
    { name: "Auditor", value: 80 },
    { name: "Caja Chica", value: 50 },
    { name: "Abogados", value: 40 },
    { name: "Asistente", value: 35 },
    { name: "cliente recurrente", value: 17 },
    { name: "Clientes", value: 10 },
];

export const getRoleName = (value: number): string => {
    const role = roles.find((role) => role.value === value);
    return role ? role.name : "";
};
