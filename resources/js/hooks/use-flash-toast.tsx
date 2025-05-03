import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";

export function useFlashToast() {
  const { flash, errors } = usePage().props as {
    flash?: { success?: string; error?: string };
    errors?: Record<string, string[]>;
  };

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const allMessages = Object.values(errors).flat();
      toast.error(
        <div>
          <div className="font-medium mb-1">Erreurs de validation :</div>
          <ul className="ml-4 list-disc space-y-1">
            {allMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>,
        { duration: 6000 }
      );
    }
  }, [errors]);
  
}
