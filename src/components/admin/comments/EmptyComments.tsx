
import { FileQuestion } from "lucide-react";

export const EmptyComments = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileQuestion className="h-12 w-12 text-gray-400 mb-3" />
      <h3 className="font-medium text-gray-900">Nessun commento in attesa</h3>
      <p className="text-gray-500 mt-2">
        Al momento non ci sono commenti che richiedono la tua attenzione.
      </p>
    </div>
  );
};
