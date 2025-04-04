
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface UsersFileUploadProps {
  isLoading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUndoLastImport: () => void;
  lastImportTimestamp: string | null;
}

export const UsersFileUpload = ({
  isLoading,
  onFileSelect,
  onUndoLastImport,
  lastImportTimestamp
}: UsersFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="outline"
        className="relative"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {isLoading ? "Importazione in corso..." : "Seleziona File Excel"}
        <input
          type="file"
          accept=".xlsx"
          onChange={onFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isLoading}
          ref={fileInputRef}
        />
      </Button>

      {lastImportTimestamp && (
        <Button
          variant="destructive"
          onClick={onUndoLastImport}
          className="gap-2"
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
          Annulla ultima importazione
        </Button>
      )}
    </div>
  );
};
