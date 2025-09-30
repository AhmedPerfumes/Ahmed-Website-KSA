"use client";
import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor("orderNumber", {
    header: "Order #",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("taxAmount", {
    header: "Tax Amount",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("paymentMethod", {
    header: "Payment Method",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("tracking", {
    header: "Tracking",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("actions", {
    header: "Actions",
    cell: () => <button className="btn btn-primary btn-sm">VIEW</button>,
    enableSorting: false,
    enableGlobalFilter: false,
  }),
];

const mockOrders = [
  {
    orderNumber: "#2416",
    date: "October 1, 2023",
    status: "On hold",
    amount: "$1,200.65",
    taxAmount: "$60.00",
    paymentMethod: "Credit Card",
    tracking: "1234567890",
  },
  {
    orderNumber: "#2417",
    date: "October 2, 2023",
    status: "Shipped",
    amount: "$850.00",
    taxAmount: "$42.50",
    paymentMethod: "PayPal",
    tracking: "TRK982734",
  },
  {
    orderNumber: "#2418",
    date: "October 3, 2023",
    status: "Completed",
    amount: "$320.00",
    taxAmount: "$16.00",
    paymentMethod: "Cash on Delivery",
    tracking: "N/A",
  },
  {
    orderNumber: "#2419",
    date: "October 4, 2023",
    status: "Processing",
    amount: "$720.00",
    taxAmount: "$36.00",
    paymentMethod: "Bank Transfer",
    tracking: "TRK123321",
  },
  {
    orderNumber: "#2420",
    date: "October 5, 2023",
    status: "Cancelled",
    amount: "$0.00",
    taxAmount: "$0.00",
    paymentMethod: "Credit Card",
    tracking: "N/A",
  },
];

export default function AccountOrders() {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 4,
  });

  useEffect(() => {
    setData(mockOrders);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
  });

  return (
    <div className="col-lg-9">
      <div className="page-content my-account__orders-list">

        {/* 🔍 Global Search Filter */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search orders..."
            value={globalFilter ?? ""}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>

        {/* 📋 Table */}
        <table className="table orders-table table-bordered table-hover">
          <thead className="table-dark">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted()
                      ? header.column.getIsSorted() === "asc"
                        ? " 🔼"
                        : " 🔽"
                      : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  No matching orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
