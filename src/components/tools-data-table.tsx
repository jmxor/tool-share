"use client";

import DataTable from "@/components/ui/data-table";
import { ToolPost } from "@/lib/posts/actions";
import { ColumnDef } from "@tanstack/react-table";

const toolsColumns: ColumnDef<ToolPost>[] = [
  { accessorKey: "tool_name", header: "Name" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "deposit", header: "Deposit" },
  {
    accessorKey: "max_borrow_days",
    header: "Max Borrow Time",
    cell: ({ row }) => {
      const max_borrow_days = parseInt(row.getValue("max_borrow_days"));
      return <div>{max_borrow_days} days</div>;
    },
  },
  { accessorKey: "location_id", header: "Postcode" },
  { accessorKey: "status", header: "Status" },
];

export default function ToolsDataTable({ data }: { data: ToolPost[] }) {
  return <DataTable columns={toolsColumns} data={data} />;
}
