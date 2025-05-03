import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
  } from "@/components/ui/form";
  import { Plus } from "lucide-react";
  import { useForm } from "react-hook-form";
  import { z } from "zod";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useState } from "react";
  import { router } from "@inertiajs/react";
  
  const addRoleSchema = z.object({
    name: z.string().min(1, "Le nom du rôle est requis"),
  });
  
  export function AddRoleDialog() {
    const [open, setOpen] = useState(false);
  
    const form = useForm<z.infer<typeof addRoleSchema>>({
      resolver: zodResolver(addRoleSchema),
      defaultValues: {
        name: "",
      },
    });
  
    const handleSubmit = (values: z.infer<typeof addRoleSchema>) => {
      router.post("/administration/roles", values, {
        preserveScroll: true,
        onSuccess: (page) => {
          setOpen(false);
          form.reset();
          const newRoleId = page.props?.flash?.created_role_id;
          if (newRoleId) {
            router.visit(`/administration/roles/${newRoleId}/edit`);
          }
        },
      });
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="ml-auto gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un rôle
          </Button>
        </DialogTrigger>
  
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un rôle</DialogTitle>
            <DialogDescription>
              Entrez un nom pour le nouveau rôle.
            </DialogDescription>
          </DialogHeader>
  
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du rôle</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du rôle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              <div className="flex justify-end">
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
  