import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import Heading from "@/components/heading";
import { BreadcrumbItem, User } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form"
import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Administration", href: "/administration" },
  { title: "Utilisateurs", href: "/administration/users" },
  { title: "Modifier un utilisateur", href: '' },
];

export default function EditUtilisateur() {
  const { user, roles } = usePage().props as {
    user: User & { roles: { name: string }[] },
    roles: { id: number; name: string }[],
  };
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, { message: "Le nom est requis" }).max(50, { message: "Le nom ne peut pas contenir plus de 50 caractères" }),
    email: z.string().email({ message: "Le courriel est invalide" }),
    password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }).max(50, { message: "Le mot de passe ne peut pas contenir plus de 50 caractères" }).optional().or(z.literal("")),
    role_id: z.coerce.number().min(1, "Le rôle est requis"),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      role_id: roles.find(r => r.name === user.roles[0]?.name)?.id ?? 0,
    },
  })

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Example of saving (replace this with your Inertia POST/PATCH request)
      await router.patch(`/administration/users/${user.id}`, values, {
        preserveScroll: true,
        onSuccess: () => {
          if (shouldRedirect) {
            router.visit("/administration/users");
          }
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Modifier un utilisateur" />

      <div className="px-4 py-6">
        <div className="flex flex-col gap-16">
          <Heading
            title="Modifier un utilisateur"
            description="Mettre à jour les informations du compte utilisateur."
          />

          {/* Formulaire principal */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">

              {/* Section Informations */}
              <section className="flex items-start gap-8 py-10">
                {/* Colonne de gauche */}
                <div className="w-1/3 flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">Informations</h2>
                  <p className="text-sm text-muted-foreground">
                    Modifier le nom et le courriel de l'utilisateur.
                  </p>
                </div>

                {/* Colonne de droite */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>

                    <div className="flex flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse courriel</FormLabel>
                            <FormControl>
                              <Input placeholder="Adresse courriel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                </div>
              </section>

              {/* Section Mot de passe */}
              <section className="flex items-start gap-8 border-t py-10">
                {/* Colonne de gauche */}
                <div className="w-1/3 flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">Mot de passe</h2>
                  <p className="text-sm text-muted-foreground">
                    Laisser vide si aucun changement n'est requis.
                  </p>
                </div>

                {/* Colonne de droite */}
                <div className="flex-1 flex flex-col gap-6 w-1/2">
                  <div className="flex flex-col gap-2">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nouveau mot de passe</FormLabel>
                            <FormControl>
                              <Input placeholder="Nouveau mot de passe" {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                </div>
                
              </section>

              {/* Section Rôle */}
              <section className="flex items-start gap-8 border-t py-10">
                {/* Colonne de gauche */}
                <div className="w-1/3 flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">Rôle</h2>
                  <p className="text-sm text-muted-foreground">
                    Choisir le rôle de l'utilisateur.
                  </p>
                </div>

                {/* Colonne de droite */}
                <div className="flex-1 flex flex-col gap-6 w-1/2">
                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="role_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rôle</FormLabel>
                          <Select
                            value={field.value?.toString() ?? ""}
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir un rôle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>
              
              <div className="flex justify-end pt-8 mt-8 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => router.visit("/administration/users")}
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
      </div>
    </AppLayout>
  );
}
