
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UsersImportProgressProps {
  isLoading: boolean;
  importProgress: number;
  totalRows: number;
  processedRows: number;
  importError: string | null;
  debugInfo: string | null;
}

export const UsersImportProgress = ({
  isLoading,
  importProgress,
  totalRows,
  processedRows,
  importError,
  debugInfo
}: UsersImportProgressProps) => {
  return (
    <>
      {importError && (
        <Alert variant="destructive">
          <AlertTitle>Errore di importazione</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{importError}</AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
        <Alert>
          <AlertTitle>Stato importazione</AlertTitle>
          <AlertDescription>{debugInfo}</AlertDescription>
        </Alert>
      )}
      
      {isLoading && totalRows > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Importazione in corso...</span>
            <span>{processedRows} di {totalRows} righe ({importProgress}%)</span>
          </div>
          <Progress value={importProgress} className="h-2" />
        </div>
      )}
    </>
  );
};
