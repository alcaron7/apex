import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Archive, Undo, Clock } from "lucide-react"; // Good icons!

export type User = {
  id: string;
  name: string;
  email: string;
  archived?: boolean;
  roles: { name: string }[];
};

interface ColumnOptions {
  onEdit: (user: User) => void;
  onArchive: (user: User) => void;
  onUnarchive: (user: User) => void;
  setHistoryUser: (user: User) => void;
}

export function getColumns({ onEdit, onArchive, onUnarchive, setHistoryUser }: ColumnOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "email",
      header: "Courriel",
    },
    {
      id: "roles",
      header: "Rôle",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role.name}
                className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-800"
              >
                {role.name}
              </span>
            ))}
          </div>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const roles = row.original.roles.map((r) => r.name);
        return roles.includes(filterValue);
      },
    },
    {
      accessorKey: "archived",
      header: "Statut",
      cell: ({ row }) => {
        const archived = row.getValue("archived") as boolean;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              archived ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {archived ? "Archivé" : "Actif"}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        const archived = row.getValue(id) as boolean;
        if (value === "Actif") return archived === false;
        if (value === "Archivé") return archived === true;
        return true;
      },
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
                  <DropdownMenuItem
                    onClick={() => setHistoryUser(user)}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <Clock className="h-4 w-4" />
                    Historique
                  </DropdownMenuItem>
      
                  {user.archived ? (
                    <DropdownMenuItem
                      onClick={() => onUnarchive(user)}
                      className="flex items-center gap-2 text-green-600 focus:text-green-700"
                    >
                      <Undo className="h-4 w-4" />
                      Désarchiver
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onArchive(user)}
                      className="flex items-center gap-2 text-red-600 focus:text-red-700"
                    >
                      <Archive className="h-4 w-4 text-red-600" />
                      Archiver
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }
  ];
}
