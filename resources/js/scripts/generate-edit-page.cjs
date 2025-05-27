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
  let entityName = null;
  let outputPath = "resources/js/pages";

  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith("--path=")) {
      outputPath = path.join("resources/js/pages", arg.split("=")[1]);
    } else {
      entityName = arg;
    }
  }

  if (!entityName) {
    entityName = await ask("Entity name (e.g. Transporteur): ");
  }

  const customPath = await ask(`Subfolder path (default: ${outputPath}): `);
  if (customPath) {
    outputPath = path.join("resources/js/pages", customPath.replace(/^\/+/g, ""));
  }

  rl.close();

  const pascal = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const pagePath = path.join(outputPath, "[id]", "edit.tsx");
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });

  const pageContent = `import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import Heading from "@/components/heading";
import { BreadcrumbItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Administration", href: "/administration" },
  { title: "${pascal(entityName)}s", href: "/administration/${entityName.toLowerCase()}s" },
  { title: "Modifier un ${entityName.toLowerCase()}", href: "" },
];

export default function Edit${pascal(entityName)}() {
  const { ${entityName.toLowerCase()} } = usePage().props as any;
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, { message: "Le champ nom est requis" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ${entityName.toLowerCase()}.name,
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    router.patch(\`/administration/${entityName.toLowerCase()}s/\${${entityName.toLowerCase()}.id}\`, values, {
      preserveScroll: true,
      onSuccess: () => {
        if (shouldRedirect) {
          router.visit("/administration/${entityName.toLowerCase()}s");
        }
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Modifier un ${entityName.toLowerCase()}" />

      <div className="px-4 py-6">
        <div className="flex flex-col gap-16">
          <Heading
            title="Modifier un ${entityName.toLowerCase()}"
            description="Mettre à jour les informations."
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">

              {/* Section Informations générales */}
              <section className="flex items-start gap-8 border-t py-10">
                <div className="w-1/3 flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">Informations générales</h2>
                  <p className="text-sm text-muted-foreground">Modifier les champs ci-dessous.</p>
                </div>
                <div className="flex-1 flex flex-col gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <div className="flex justify-end pt-8 mt-8 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => router.visit("/administration/${entityName.toLowerCase()}s")}
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
`;

  fs.writeFileSync(pagePath, pageContent);
  console.log(`✅ Edit page created at: ${pagePath}`);
})();
