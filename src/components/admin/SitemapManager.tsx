import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface SitemapResult {
  success: boolean;
  message: string;
  urlCount: number;
  fileCount: number;
  files?: string[];
}

export function SitemapManager() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SitemapResult | null>(null);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setProgress(10);
    setResult(null);

    try {
      setProgress(30);
      
      const { data, error } = await supabase.functions.invoke('regenerate-sitemaps', {
        method: 'POST'
      });

      if (error) {
        throw error;
      }

      setProgress(90);

      if (data.success) {
        setResult(data);
        setProgress(100);
        toast.success("Sitemap rigenerate con successo!", {
          description: `${data.urlCount} URL processati in ${data.fileCount} file`
        });
      } else {
        throw new Error(data.error || 'Errore sconosciuto');
      }
    } catch (error) {
      console.error('Error regenerating sitemaps:', error);
      toast.error("Errore nella rigenerazione delle sitemap", {
        description: error instanceof Error ? error.message : "Si è verificato un errore"
      });
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Errore sconosciuto",
        urlCount: 0,
        fileCount: 0
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Gestione Sitemap
          </CardTitle>
          <CardDescription>
            Rigenera le sitemap XML a partire dai dati nel database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              onClick={handleRegenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rigenerazione in corso...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rigenera Sitemap
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progresso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <p className={`font-medium ${
                    result.success 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {result.message}
                  </p>
                  {result.success && (
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p>• URL processati: {result.urlCount}</p>
                      <p>• File generati: {result.fileCount}</p>
                      {result.files && result.files.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer hover:underline">
                            Mostra file generati
                          </summary>
                          <ul className="mt-1 ml-4 space-y-0.5">
                            {result.files.slice(0, 10).map((file, idx) => (
                              <li key={idx}>• {file}</li>
                            ))}
                            {result.files.length > 10 && (
                              <li>... e altri {result.files.length - 10} file</li>
                            )}
                          </ul>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Note:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Le sitemap vengono generate a partire dalla tabella review_urls</li>
              <li>Vengono create 5 URL per file sitemap</li>
              <li>I file vengono salvati nel bucket storage "sitemaps"</li>
              <li>Viene generato anche un file sitemap-index.xml</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
