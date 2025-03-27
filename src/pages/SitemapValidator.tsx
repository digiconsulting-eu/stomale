
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  totalFiles: number;
  totalUrls: number;
  validUrls: number;
  invalidUrls: number;
  invalidUrlsList: Array<{
    url: string;
    reason: string;
    reviewId?: string;
    condition?: string;
  }>;
  filesSummary: Array<{
    filename: string;
    totalUrls: number;
    validUrls: number;
    invalidUrls: number;
  }>;
}

const SitemapValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateSitemaps = async () => {
    setIsValidating(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sitemap-validator');
      
      if (error) {
        throw new Error(`Error invoking sitemap-validator: ${error.message}`);
      }
      
      setResults(data as ValidationResult);
    } catch (err) {
      console.error('Error validating sitemaps:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Sitemap Validator</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Validate Sitemap URLs</CardTitle>
          <CardDescription>
            Check if all URLs in the sitemap files exist in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={validateSitemaps}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : 'Start Validation'}
          </Button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded border border-red-200">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {results && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Validation Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{results.totalFiles}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{results.totalUrls}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Valid URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{results.validUrls}</p>
                <p className="text-sm text-gray-500">
                  {Math.round((results.validUrls / results.totalUrls) * 100)}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Invalid URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{results.invalidUrls}</p>
                <p className="text-sm text-gray-500">
                  {Math.round((results.invalidUrls / results.totalUrls) * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Files Summary</TabsTrigger>
              <TabsTrigger value="invalid">Invalid URLs ({results.invalidUrlsList.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Files Summary</CardTitle>
                  <CardDescription>Summary of validation results by file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left border">Filename</th>
                          <th className="p-2 text-center border">Total URLs</th>
                          <th className="p-2 text-center border">Valid</th>
                          <th className="p-2 text-center border">Invalid</th>
                          <th className="p-2 text-center border">Valid %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.filesSummary.map((file, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 border">{file.filename}</td>
                            <td className="p-2 text-center border">{file.totalUrls}</td>
                            <td className="p-2 text-center border text-green-600">{file.validUrls}</td>
                            <td className="p-2 text-center border text-red-600">{file.invalidUrls}</td>
                            <td className="p-2 text-center border">
                              {file.totalUrls > 0 ? Math.round((file.validUrls / file.totalUrls) * 100) : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="invalid">
              <Card>
                <CardHeader>
                  <CardTitle>Invalid URLs</CardTitle>
                  <CardDescription>List of URLs that failed validation</CardDescription>
                </CardHeader>
                <CardContent>
                  {results.invalidUrlsList.length === 0 ? (
                    <p className="text-green-600 font-medium">No invalid URLs found!</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left border">URL</th>
                            <th className="p-2 text-left border">Review ID</th>
                            <th className="p-2 text-left border">Condition</th>
                            <th className="p-2 text-left border">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.invalidUrlsList.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-2 border">
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate block max-w-xs"
                                >
                                  {item.url}
                                </a>
                              </td>
                              <td className="p-2 border">{item.reviewId || 'N/A'}</td>
                              <td className="p-2 border">{item.condition || 'N/A'}</td>
                              <td className="p-2 border">{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default SitemapValidator;
