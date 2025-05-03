import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import Heading from "@/components/heading";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ArrowLeft, X } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Administration", href: "/administration" },
  { title: "Rôles", href: "/administration/roles" },
  { title: "Modifier un rôle", href: "" },
];

// Section labels translations
const sectionLabels: Record<string, string> = {
  users: "Utilisateurs",
};

const formSchema = z.object({
  permissions: z.array(z.string()),
});

export default function EditRole() {
  const { role, permissions } = usePage().props as {
    role: { id: number; name: string; permissions: string[] };
    permissions: { id: number; name: string; display_name: string }[];
  };

  const [shouldRedirect, setShouldRedirect] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permissions: role.permissions ?? [],
    },
  });

  const grouped = permissions.reduce((acc, permission) => {
    const [section] = permission.name.split(".");
    acc[section] = acc[section] || [];
    acc[section].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await router.put(`/administration/roles/${role.id}`, values, {
      preserveScroll: true,
      onSuccess: () => {
        if (shouldRedirect) {
          router.visit("/administration/roles");
        }
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Modifier le rôle "${role.name}"`} />

      <div className="px-4 py-6 flex flex-col gap-8">
        <Heading title={`Modifier le rôle "${role.name}"`} description="Attribuez les permissions à ce rôle" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {Object.entries(grouped).map(([section, perms]) => (
              <div key={section}>
                <h2 className="text-lg font-semibold capitalize mb-4">
                  {sectionLabels[section] ?? section}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {perms.map((permission) => (
                    <FormField
                      key={permission.id}
                      control={form.control}
                      name="permissions"
                      render={() => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={form.watch("permissions").includes(permission.name)}
                              onCheckedChange={(checked) => {
                                const current = form.getValues("permissions");
                                form.setValue(
                                  "permissions",
                                  checked
                                    ? [...current, permission.name]
                                    : current.filter((p) => p !== permission.name)
                                );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {permission.display_name ?? permission.name}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}

            <FormMessage />

            <div className="flex justify-end pt-8 mt-8 gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => router.visit("/administration/roles")}
              >
                <X size={16} />
                Annuler
              </Button>

              <Button
                type="submit"
                variant="secondary"
                className="w-auto flex items-center gap-2"
                onClick={() => setShouldRedirect(false)}
              >
                <Save size={16} />
                Sauvegarder
              </Button>

              <Button
                type="submit"
                className="w-auto flex items-center gap-2"
                onClick={() => setShouldRedirect(true)}
              >
                <ArrowLeft size={16} />
                Sauvegarder et quitter
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
