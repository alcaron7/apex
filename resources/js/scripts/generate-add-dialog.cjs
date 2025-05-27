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
  let [entityName, ...fields] = process.argv.slice(2);
  let outputPath = "resources/js/components";

  if (!entityName) entityName = await ask("Entity name (PascalCase, e.g. User): ");

  if (fields.length === 0) {
    const inputFields = await ask("Enter fields (format: name:type, e.g. name:string age:number): ");
    fields = inputFields.split(" ").filter(Boolean);
  }

  const customPath = await ask(`Subfolder path (default: ${outputPath}): `);
  if (customPath) {
    outputPath = path.join("resources/js/pages", customPath.replace(/^\/+/g, ""));
  }

  const defaultRoute = `/administration/${entityName.toLowerCase()}s`;
  const routeBase = await ask(`Base route (default: ${defaultRoute}): `) || defaultRoute;

  rl.close();

  const componentName = `Add${entityName}Dialog`;
  const fileName = `add-${entityName.toLowerCase()}-dialog.tsx`;
  const filePath = path.resolve(process.cwd(), outputPath, fileName);
  const schemaName = `${entityName.toLowerCase()}Schema`;

  const schemaFields = fields.map(f => {
    const [name, type] = f.split(":");
    let zod;
    switch (type) {
      case "string":
        zod = `z.string().min(1, "Le champ ${name} est requis")`;
        break;
      case "email":
        zod = `z.string().email("Le champ ${name} est invalide")`;
        break;
      case "number":
        zod = `z.coerce.number().min(1, "Le champ ${name} est requis")`;
        break;
      default:
        zod = "z.any()";
    }
    return `  ${name}: ${zod},`;
  }).join("\n");

  const defaultValues = fields.map(f => {
    const [name, type] = f.split(":");
    switch (type) {
      case "string":
      case "email":
        return `    ${name}: "",`;
      case "number":
        return `    ${name}: 0,`;
      default:
        return `    ${name}: undefined,`;
    }
  }).join("\n");

  const formFields = fields.map(f => {
    const [name, type] = f.split(":");
    const isPassword = name.toLowerCase().includes("password");
    return `
            <FormField
              control={form.control}
              name="${name}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>${name.charAt(0).toUpperCase() + name.slice(1)}</FormLabel>
                  <FormControl>
                    <Input ${isPassword ? 'type="password"' : ''} placeholder="${name}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
  }).join("\n");

  const content = `
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

const ${schemaName} = z.object({
${schemaFields}
});

export function ${componentName}() {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof ${schemaName}>>({
    resolver: zodResolver(${schemaName}),
    defaultValues: {
${defaultValues}
    },
  });

  const handleSubmit = (values: z.infer<typeof ${schemaName}>) => {
    router.post("${routeBase}", values, {
      preserveScroll: true,
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un ${entityName.toLowerCase()}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un ${entityName.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Remplissez les champs ci-dessous pour créer un ${entityName.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
${formFields}
            <div className="flex justify-end">
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
`;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trim());

  console.log(`✅ ${componentName} created at ${filePath}`);
})();

