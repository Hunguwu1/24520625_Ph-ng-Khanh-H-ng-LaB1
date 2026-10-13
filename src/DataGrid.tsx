import { useId, useState } from "react";
import type { DataGridProps } from "./data-grid-contract";

export default function DataGrid<T>({
    data,
    columns,
    ariaLabel,
}: DataGridProps<T>) {
    const [query, setQuery] = useState("");
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<
        "ascending" | "descending"
    >("ascending");

    const searchId = useId();
    const searchText = query.trim().toLocaleLowerCase();

    const filteredData = data.filter((item) =>
        columns.some((column) =>
            String(item[column.accessorKey] ?? "")
                .toLocaleLowerCase()
                .includes(searchText)
        )
    );

    const sortedData = [...filteredData];

    if (sortKey !== null) {
        sortedData.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            const result =
                typeof aValue === "number" && typeof bValue === "number"
                    ? aValue - bValue
                    : String(aValue ?? "").localeCompare(String(bValue ?? ""), "vi", {
                        numeric: true,
                        sensitivity: "base",
                    });

            return sortDirection === "ascending" ? result : -result;
        });
    }

    function handleSort(key: keyof T) {
        if (sortKey === key) {
            setSortDirection((current) =>
                current === "ascending" ? "descending" : "ascending"
            );
        } else {
            setSortKey(key);
            setSortDirection("ascending");
        }
    }

    return (
        <>
            <label htmlFor={searchId}>Tìm kiếm: </label>
            <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />

            <table role="grid" aria-label={ariaLabel}>
                <thead>
                    <tr role="row">
                        {columns.map((column) => {
                            const isSorted = sortKey === column.accessorKey;

                            return (
                                <th
                                    key={String(column.accessorKey)}
                                    scope="col"
                                    role="columnheader"
                                    aria-sort={isSorted ? sortDirection : undefined}
                                >
                                    {column.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => handleSort(column.accessorKey)}
                                        >
                                            {column.header}
                                            {isSorted && (
                                                <span aria-hidden="true">
                                                    {sortDirection === "ascending" ? " ▲" : " ▼"}
                                                </span>
                                            )}
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {sortedData.map((item, rowIndex) => (
                        <tr key={rowIndex} role="row">
                            {columns.map((column) => (
                                <td key={String(column.accessorKey)} role="gridcell">
                                    {String(item[column.accessorKey] ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}

                    {sortedData.length === 0 && (
                        <tr role="row">
                            <td role="gridcell" colSpan={columns.length}>
                                Không tìm thấy kết quả
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );
}