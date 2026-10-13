import DataGrid from "./DataGrid";
import { employees, employeeColumns } from "./sample-data";
import "./App.css";

export default function App() {
  return (
    <main>
      <h1>Danh sách nhân viên</h1>
      <DataGrid
        data={employees}
        columns={employeeColumns}
        ariaLabel="Danh sách nhân viên"
      />
    </main>
  );
}
