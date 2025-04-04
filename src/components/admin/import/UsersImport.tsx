
import React from "react";
import { UsersImportInstructions } from "./UsersImportInstructions";
import { UsersTemplateDownload } from "./UsersTemplateDownload";
import { UsersImportProgress } from "./UsersImportProgress";
import { UsersFileUpload } from "./UsersFileUpload";
import { useUsersImport } from "@/hooks/useUsersImport";

export const UsersImport = () => {
  const {
    isLoading,
    importError,
    debugInfo,
    importProgress,
    totalRows,
    processedRows,
    lastImportTimestamp,
    handleFileUpload,
    handleUndoLastImport
  } = useUsersImport();

  return (
    <div className="space-y-6">
      <UsersImportInstructions />
      
      <UsersImportProgress 
        isLoading={isLoading}
        importProgress={importProgress}
        totalRows={totalRows}
        processedRows={processedRows}
        importError={importError}
        debugInfo={debugInfo}
      />
      
      <div className="flex flex-wrap items-center gap-4">
        <UsersTemplateDownload />
        
        <UsersFileUpload
          isLoading={isLoading}
          onFileSelect={handleFileUpload}
          onUndoLastImport={handleUndoLastImport}
          lastImportTimestamp={lastImportTimestamp}
        />
      </div>
    </div>
  );
};
