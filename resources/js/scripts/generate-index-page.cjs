const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

(async () => {
  let [entityName, propName] = process.argv.slice(2);
  let outputPath = "resources/js/pages";

  if (!entityName) entityName = await ask("Entity name (PascalCase, e.g. Transporteur): ");
  if (!propName) propName = await ask("Plural slug (e.g. transporteurs): ");
  const customPath = await ask(`Subfolder path (default: ${outputPath}): `);
  if (customPath) {
    outputPath = path.join(outputPath, customPath.replace(/^\/+/g, ""));
  }
  rl.close();

  const pascalName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const pluralSlug = propName.toLowerCase();
  const folderPath = path.resolve(process.cwd(), outputPath);
  const indexFile = path.join(folderPath, "index.tsx");
  const columnsFile = path.join(folderPath, "columns.tsx");

  const indexContent = `
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { DataTable } from 'rowza'
import { getColumns, ${pascalName} } from "./columns";
import Heading from "@/components/heading";
import { Add${pascalName}Dialog } from "./add-${pascalName.toLowerCase()}-dialog";
import { ModelHistoryDialog } from "@/components/history-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Administration", href: "/administration" },
  { title: "${pascalName}s", href: "/administration/${pluralSlug}" },
];

export default function ${pascalName}s() {
  const { ${pluralSlug} } = usePage().props as { ${pluralSlug}: ${pascalName}[] };
  const [historyItem, setHistoryItem] = useState<${pascalName} | null>(null);
  const [confirmItem, setConfirmItem] = useState<${pascalName} | null>(null);
  const [confirmType, setConfirmType] = useState<"archive" | "unarchive" | null>(null);

  function handleEdit(item: ${pascalName}) {
    router.visit(\`/administration/${pluralSlug}/\${item.id}/edit\`);
  }

  function confirmAction(item: ${pascalName}, type: "archive" | "unarchive") {
    setConfirmItem(item);
    setConfirmType(type);
  }

  function handleConfirm() {
    if (!confirmItem || !confirmType) return;
    const route = \`/administration/${pluralSlug}/\${confirmItem.id}/\${confirmType}\`;
    router.put(route, { preserveScroll: true });
    setConfirmItem(null);
    setConfirmType(null);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="${pascalName}s" />

      <div className="px-4 py-6">
        <div className="flex flex-row gap-4">
          <Heading title="${pascalName}s" description="Gérez vos ${pluralSlug}" />
          <Add${pascalName}Dialog />
        </div>
        
        <div className="flex flex-col gap-4">
          <DataTable 
            columns={getColumns({
              onEdit: handleEdit,
              onArchive: (item) => confirmAction(item, "archive"),
              onUnarchive: (item) => confirmAction(item, "unarchive"),
              setHistoryItem,
            })} 
            data={${pluralSlug}}
            labels={{
              searchPlaceholder: "Rechercher...",
              resetFilters: "Réinitialiser",
              noResults: "Aucun résultat trouvé",
              pageLabel: (page, total) => \`Page \${page} de \${total}\`,
            }}
            filters={[
              {
                columnId: "archived",
                placeholder: "Statut",
                defaultValue: "Actif",
                options: [
                  { label: "Actif", value: "Actif" },
                  { label: "Archivé", value: "Archivé" },
                ],
              },
            ]}
          />

          <ModelHistoryDialog
            open={!!historyItem}
            onClose={() => setHistoryItem(null)}
            title={\`Historique de \${historyItem?.name}\`}
            historyRoute={\`/administration/${pluralSlug}/\${historyItem?.id}/history\`}
          />

          <ConfirmDialog
            open={!!confirmItem}
            onClose={() => setConfirmItem(null)}
            onConfirm={handleConfirm}
            title={confirmType === "archive" ? "Archiver" : "Désarchiver"}
            description={
              confirmType === "archive"
                ? \`Voulez-vous vraiment archiver "\${confirmItem?.name}" ?\`
                : \`Voulez-vous vraiment désarchiver "\${confirmItem?.name}" ?\`
            }
          />
        </div>
      </div>
    </AppLayout>
  );
}
`.trim();

  const columnsContent = `
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Archive, Undo, Clock } from "lucide-react";

export type ${pascalName} = {
  id: string;
  name: string;
  archived?: boolean;
};

interface ColumnOptions {
  onEdit: (item: ${pascalName}) => void;
  onArchive: (item: ${pascalName}) => void;
  onUnarchive: (item: ${pascalName}) => void;
  setHistoryItem: (item: ${pascalName}) => void;
}

export function getColumns({ onEdit, onArchive, onUnarchive, setHistoryItem }: ColumnOptions): ColumnDef<${pascalName}>[] {
  return [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "archived",
      header: "Statut",
      cell: ({ row }) => {
        const archived = row.getValue("archived") as boolean;
        return (
          <span className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium \${archived ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}\`}>
            {archived ? "Archivé" : "Actif"}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        const archived = row.getValue(id) as boolean;
        return value === "Actif" ? !archived : archived;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center rounded-md p-2 hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(item)} className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHistoryItem(item)} className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4" />
                  Historique
                </DropdownMenuItem>
                {item.archived ? (
                  <DropdownMenuItem onClick={() => onUnarchive(item)} className="flex items-center gap-2 text-green-600 focus:text-green-700">
                    <Undo className="h-4 w-4" />
                    Désarchiver
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onArchive(item)} className="flex items-center gap-2 text-red-600 focus:text-red-700">
                    <Archive className="h-4 w-4 text-red-600" />
                    Archiver
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
`.trim();

  fs.mkdirSync(folderPath, { recursive: true });
  fs.writeFileSync(indexFile, indexContent);
  fs.writeFileSync(columnsFile, columnsContent);

  console.log(`✅ Created index.tsx and columns.tsx for ${entityName} in ${folderPath}`);
})();
