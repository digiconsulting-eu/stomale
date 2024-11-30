import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { Download } from "lucide-react";
import { Link } from "react-router-dom";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const storedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    setReviews(storedReviews);
  }, []);

  const handleExportExcel = () => {
    const exportData = reviews.map((review, index) => ({
      'N°': index + 1,
      'Titolo': review.title,
      'Autore': review.author || review.username,
      'Patologia': review.condition,
      'Data': review.date,
      'Stato': review.status === 'approved' ? 'Approvata' : 'In attesa',
      'Esperienza': review.experience
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recensioni");
    XLSX.writeFile(wb, "recensioni.xlsx");
  };

  const getReviewUrl = (review: any) => {
    const conditionSlug = review.condition.toLowerCase().replace(/\s+/g, '-');
    const titleSlug = (review.title || `esperienza-con-${review.condition}`).toLowerCase().replace(/\s+/g, '-');
    return `/patologia/${conditionSlug}/esperienza/${titleSlug}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Recensioni</h1>
        <Button onClick={handleExportExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Esporta Excel
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Titolo</TableHead>
              <TableHead>Autore</TableHead>
              <TableHead>Patologia</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review, index) => (
              <TableRow key={review.id || `${review.title}-${review.date}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Link 
                    to={getReviewUrl(review)}
                    className="text-primary hover:underline"
                  >
                    {review.title || `Esperienza con ${review.condition}`}
                  </Link>
                </TableCell>
                <TableCell>{review.author || review.username}</TableCell>
                <TableCell>{review.condition}</TableCell>
                <TableCell>{review.date}</TableCell>
                <TableCell>
                  {review.status === 'approved' ? 'Approvata' : 'In attesa'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewManagement;