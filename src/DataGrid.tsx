import { useId, useState } from "react";
import type { DataGridProps } from "./data-grid-contract";
import type { KeyboardEvent } from "react";

export default function DataGrid<T>({
    data,
    columns,
    ariaLabel,
    onRowSelect,
}: DataGridProps<T>) {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<
        "ascending" | "descending"
    >("ascending");

    const searchId = useId();
    const instructionsId = useId();
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
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, totalPages);

    const pageData = sortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    function handleSort(key: keyof T) {
        setPage(1);
        if (sortKey === key) {
            setSortDirection((current) =>
                current === "ascending" ? "descending" : "ascending"
            );
        } else {
            setSortKey(key);
            setSortDirection("ascending");
        }
    }
    function selectRow(item: T) {
        setSelectedItem(item);
        onRowSelect?.(item);
    }
    function getCellTabIndex(row: number, col: number) {
        const activeRow = Math.min(activeCell.row, pageData.length);
        const activeCol = Math.min(activeCell.col, columns.length - 1);

        return row === activeRow && col === activeCol ? 0 : -1;
    }

    function handleGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
        const target = event.target;

        if (!(target instanceof HTMLElement)) return;

        const cell = target.closest<HTMLElement>(
            "[data-grid-row][data-grid-col]"
        );

        if (!cell) return;

        const row = Number(cell.dataset.gridRow);
        const col = Number(cell.dataset.gridCol);

        // Chọn hoặc bỏ chọn hàng dữ liệu.
        if (row > 0 && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            if (event.repeat) return;

            const item = pageData[row - 1];

            if (event.key === " " && selectedItem === item) {
                setSelectedItem(null);
            } else {
                selectRow(item);
            }

            return;
        }

        let nextRow = row;
        let nextCol = col;

        switch (event.key) {
            case "ArrowUp":
                nextRow--;
                break;
            case "ArrowDown":
                nextRow++;
                break;
            case "ArrowLeft":
                nextCol--;
                break;
            case "ArrowRight":
                nextCol++;
                break;
            default:
                return;
        }

        event.preventDefault();

        nextRow = Math.max(0, Math.min(nextRow, pageData.length));
        nextCol = Math.max(0, Math.min(nextCol, columns.length - 1));

        const nextCell = event.currentTarget.querySelector<HTMLElement>(
            `[data-grid-row="${nextRow}"][data-grid-col="${nextCol}"]`
        );

        const nextTarget =
            nextCell?.querySelector<HTMLButtonElement>("button") ?? nextCell;

        nextTarget?.focus();
    }

    return (
        <>
            <label htmlFor={searchId}>Tìm kiếm: </label>
            <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                }}
            />
            <p id={instructionsId}>
                Dùng phím mũi tên để di chuyển giữa các ô.
                Nhấn Enter để chọn hàng, Space để chọn hoặc bỏ chọn.
                Nhấn Tab để rời bảng.
            </p>

            <p role="status">
                {sortedData.length === 0
                    ? "Không tìm thấy kết quả"
                    : `Tìm thấy ${sortedData.length} kết quả`}
            </p>

            <table
                role="grid"
                aria-label={ariaLabel}
                aria-describedby={instructionsId}
                aria-rowcount={sortedData.length + 1}
                onKeyDown={handleGridKeyDown}
            >
                <thead>
                    <tr role="row" aria-rowindex={1}>
                        {columns.map((column, columnIndex) => {
                            const isSorted = sortKey === column.accessorKey;

                            return (
                                <th
                                    key={String(column.accessorKey)}
                                    scope="col"
                                    role="columnheader"
                                    aria-sort={isSorted ? sortDirection : undefined}
                                    data-grid-row={0}
                                    data-grid-col={columnIndex}
                                    tabIndex={
                                        column.sortable ? undefined : getCellTabIndex(0, columnIndex)
                                    }
                                    onFocus={() => setActiveCell({ row: 0, col: columnIndex })}
                                >
                                    {column.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => handleSort(column.accessorKey)}
                                            tabIndex={getCellTabIndex(0, columnIndex)}
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
                    {pageData.map((item, rowIndex) => (
                        <tr
                            key={rowIndex}
                            role="row"
                            aria-rowindex={(currentPage - 1) * pageSize + rowIndex + 2}
                            aria-selected={selectedItem === item}
                            onClick={() => selectRow(item)}
                        >
                            {columns.map((column, columnIndex) => (
                                <td
                                    key={String(column.accessorKey)}
                                    role="gridcell"
                                    data-grid-row={rowIndex + 1}
                                    data-grid-col={columnIndex}
                                    tabIndex={getCellTabIndex(rowIndex + 1, columnIndex)}
                                    onFocus={() =>
                                        setActiveCell({ row: rowIndex + 1, col: columnIndex })
                                    }
                                    onClick={(event) => event.currentTarget.focus()}
                                >
                                    {String(item[column.accessorKey] ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}


                </tbody>
            </table>
            <nav aria-label={`Phân trang: ${ariaLabel}`}>
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                >
                    Trang trước
                </button>

                <span aria-live="polite">
                    {" "}Trang {currentPage} / {totalPages}{" "}
                </span>

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                >
                    Trang sau
                </button>
            </nav>
        </>
    );
}