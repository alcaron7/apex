import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { DataTable } from 'rowza'
import { getColumns, User } from "./columns";
import Heading from "@/components/heading";
import { AddUserDialog } from "./add-user-dialog";
import { Role } from "../roles/columns";
import { ModelHistoryDialog } from "@/components/history-dialog";
import { useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Administration", href: "/administration" },
  { title: "Utilisateurs", href: "/administration/users" },
];

export default function Utilisateurs() {
  const { users, roles } = usePage().props as { users: User[], roles: Role[] };
  const [historyUser, setHistoryUser] = useState<User | null>(null);

  function handleEdit(user: User) {
    router.visit(`/administration/users/${user.id}/edit`);
  }

  function handleArchive(user: User) {
    try {
      router.get(`/administration/users/${user.id}/archive`, {
        preserveScroll: true,
      });
    } catch (error) {
      console.error(error);
    }
  }

  function handleUnarchive(user: User) {
    try {
      router.get(`/administration/users/${user.id}/unarchive`, {
        preserveScroll: true,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Utilisateurs" />

      <div className="px-4 py-6">
        <div className="flex flex-row gap-4">
          <Heading title="Utilisateurs" description="Gérez vos utilisateurs" />
          <AddUserDialog roles={roles} />
        </div>
        
        <div className="flex flex-col gap-4">
          <DataTable 
            columns={getColumns({
              onEdit: handleEdit,
              onArchive: handleArchive,
              onUnarchive: handleUnarchive,
              setHistoryUser: setHistoryUser,
            })} 
            data={users}
            labels={{
              searchPlaceholder: "Rechercher...",
              resetFilters: "Réinitialiser",
              noResults: "Aucun résultat trouvé",
              pageLabel: (page, total) => `Page ${page} de ${total}`,
            }}
            filters={[
              {
                columnId: "archived",
                placeholder: "Statut",
                options: [
                  { label: "Actif", value: "Actif" },
                  { label: "Archivé", value: "Archivé" },
                ],
              },
              {
                columnId: "roles",
                placeholder: "Rôle",
                options: roles.map((role) => ({
                  label: role.name,
                  value: role.name,
                })),
              },
            ]}
            
          />
          <ModelHistoryDialog
            open={!!historyUser}
            onClose={() => setHistoryUser(null)}
            title={`Historique de ${historyUser?.name}`}
            historyRoute={`/administration/users/${historyUser?.id}/history`}
          />
        </div>
      </div>
    </AppLayout>
  );
}
