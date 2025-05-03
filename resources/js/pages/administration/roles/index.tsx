import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Plus } from "lucide-react";
import { getColumns, Role } from "./columns";
import { DataTable } from 'rowza'
import { AddRoleDialog } from "./add-role-dialog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '/administration',
    },
    {
        title: 'Rôles',
        href: '/administration/roles',
    },
];

export default function Roles() {
    const { roles } = usePage().props as { role: Role[] };

    function handleEdit(role: Role) {
        router.visit(`/administration/roles/${role.id}/edit`);
      }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rôles" />

            <div className="px-4 py-6">
                <div className="flex flex-row gap-4">
                    <Heading title="Rôles" description="Gérez vos rôles et leurs permissions" />
                    <AddRoleDialog />
                </div>
                <div className="flex flex-col gap-4">
                    <DataTable 
                        columns={getColumns({
                        onEdit: handleEdit,
                        })} 
                        data={roles}
                        labels={{
                        searchPlaceholder: "Rechercher...",
                        resetFilters: "Réinitialiser",
                        noResults: "Aucun résultat trouvé",
                        pageLabel: (page, total) => `Page ${page} de ${total}`,
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}