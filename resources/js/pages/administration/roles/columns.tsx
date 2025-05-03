import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Archive, Undo } from "lucide-react"; // Good icons!

export type Role = {
  id: string;
  name: string;
};

interface ColumnOptions {
  onEdit: (role: Role) => void;
}

export function getColumns({ onEdit}: ColumnOptions): ColumnDef<Role>[] {
  return [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const user = row.original;
      
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center rounded-md p-2 hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => onEdit(user)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }
  ];
}
