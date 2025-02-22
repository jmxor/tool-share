"use client";

import DataTable from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// TODO: move all types to actions file
type Tool = {
  id: number;
  user_id: number;
  tool_name: string;
  description: string;
  deposit: number;
  max_borrow_days: number;
  location_id: number;
  status: string;
};

const toolsColumns: ColumnDef<Tool>[] = [
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

export default function ToolsDataTable({ data }: { data: Tool[] }) {
  return <DataTable columns={toolsColumns} data={data} />;
}
