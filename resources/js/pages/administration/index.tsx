import Heading from "@/components/heading";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCan } from "@/hooks/use-permissions";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { ChevronRight, File, Lock, Palette, PaintRoller, Shield, Truck, Users } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '/administration',
    },
];

export default function Administration() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administration" />

            {/* Authentification et sécurité */}
            <div className="px-4 py-6">
                <Heading title="Authentification et sécurité" description="Gérez vos utilisateurs et leurs accès" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Utilisateurs */}
                    {useCan('users.index') && (
                        <Link href="/administration/users">
                            <Card>
                                <CardHeader>
                                <CardTitle>
                                    <div className="flex flex-row gap-2 items-center">
                                        <Users className="w-8 h-8" />
                                        <div>
                                            <div className="text-lg font-bold">
                                                Utilisateurs
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Gérer les utilisateurs et leurs accès
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto" />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                    )}

                    {/* Rôles */}
                    {useCan('roles.index') && (
                        <Link href="/administration/roles">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex flex-row gap-2 items-center">
                                        <Shield className="w-8 h-8" />
                                        <div>
                                            <div className="text-lg font-bold">
                                                Rôles
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Gérer les rôles et leurs permissions
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto" />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            </Card>
                        </Link>
                    )}
                </div>

            </div>


            {/* Configurations diverses */}
            <div className="px-4 py-6">
                <Heading title="Configurations diverses" description="Gérez vos configurations diverses" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                </div>
            </div>
        </AppLayout>
    );
}
