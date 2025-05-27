import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { decode } from "html-entities";

interface HistoryEntry {
  date: string;
  user: string;
  event: string;
  changes: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  historyRoute: string; // ex: `/users/1/history`
}

export function ModelHistoryDialog({ open, onClose, title, historyRoute }: Props) {
  const [history, setHistory] = useState<{
    data: HistoryEntry[];
    links: any[];
    current_page: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const currentPage = history?.current_page ?? 1;

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    fetch(historyRoute)
    .then((res) => res.json())
    .then((data) => {
        setHistory(data);
        setLoading(false);
    });
  }, [open, historyRoute]);

  function fetchPage(url: string) {
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {loading || !history ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-6">
            {history.data.map((log, i) => (
              <div key={i} className="border-b pb-4">
                <div className="text-sm text-gray-500">{log.date} — {log.user}</div>
                <div className="font-medium">{log.event}</div>
                <ul className="list-disc ml-6 text-sm text-gray-700 mt-1">
                  {log.changes.map((c, j) => (
                    <li key={j}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex gap-2">
            {history.links.map((link, i) => {
              const raw = link.label ?? "";
              const label = typeof raw === "string" ? decode(raw) : "";

              const isPrev = label.toLowerCase().includes("previous");
              const isNext = label.toLowerCase().includes("next");
              const isEllipsis = label === "...";
              const isPageNumber = !isPrev && !isNext && !isEllipsis;
              const pageNum = parseInt(label);

              const showLink =
                isPrev ||
                isNext ||
                isEllipsis ||
                (isPageNumber && Math.abs(pageNum - currentPage) <= 2);

              if (!showLink) return null;

              if (isEllipsis) {
                return (
                  <span key={i} className="px-2 py-1 text-sm text-gray-500">
                    …
                  </span>
                );
              }

              return (
                <button
                  key={i}
                  onClick={() => link.url && fetchPage(link.url)}
                  disabled={!link.url}
                  className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
                    link.active ? "bg-black text-white" : "bg-gray-200"
                  }`}
                >
                  {isPrev ? (
                    <>
                      <ChevronLeft className="w-4 h-4" />
                      <span className="sr-only">Précédent</span>
                    </>
                  ) : isNext ? (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span className="sr-only">Suivant</span>
                    </>
                  ) : (
                    label
                  )}
                </button>
              );
            })}

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
