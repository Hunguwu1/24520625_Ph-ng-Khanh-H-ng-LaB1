import type { ColumnDef } from "./data-grid-contract";

export interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
}

export const employees: Employee[] = [
    { id: 1, name: "An", department: "Kế toán", salary: 12000000 },
    { id: 2, name: "Bình", department: "Kỹ thuật", salary: 18000000 },
    { id: 3, name: "Chi", department: "Nhân sự", salary: 14000000 },
    { id: 4, name: "Dũng", department: "Kỹ thuật", salary: 20000000 },
    { id: 5, name: "Hà", department: "Kế toán", salary: 15000000 },
    { id: 6, name: "Minh", department: "Nhân sự", salary: 16000000 },
];

export const employeeColumns: ColumnDef<Employee>[] = [
    { header: "Mã", accessorKey: "id", sortable: true },
    { header: "Họ tên", accessorKey: "name", sortable: true },
    { header: "Phòng ban", accessorKey: "department", sortable: true },
    { header: "Lương", accessorKey: "salary", sortable: true },
];