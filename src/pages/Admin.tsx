import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";

// Temporary mock data
const MOCK_REVIEWS = [
  {
    id: "1",
    title: "La mia esperienza con l'emicrania cronica",
    author: "Mario Rossi",
    condition: "Emicrania",
    status: "pending",
    date: "2024-02-20",
  },
  {
    id: "2",
    title: "Gestire l'artrite reumatoide",
    author: "Laura Bianchi",
    condition: "Artrite Reumatoide",
    status: "approved",
    date: "2024-02-19",
  },
];

const MOCK_COMMENTS = [
  {
    id: "1",
    content: "Grazie per aver condiviso la tua esperienza...",
    author: "Giuseppe Verdi",
    reviewTitle: "La mia esperienza con l'emicrania cronica",
    status: "pending",
    date: "2024-02-21",
  },
];

const MOCK_ADMINS = [
  {
    id: "1",
    email: "franca.castelli@jobreference.it",
    dateAdded: "2024-02-01",
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "review",
    title: "Nuova recensione",
    content: "Mario Rossi ha pubblicato una nuova recensione",
    date: "2024-02-20",
    read: false,
  },
  {
    id: "2",
    type: "comment",
    title: "Nuovo commento",
    content: "Giuseppe Verdi ha commentato una recensione",
    date: "2024-02-21",
    read: false,
  },
];

const Admin = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [admins, setAdmins] = useState(MOCK_ADMINS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const handleReviewAction = (id: string, action: "approve" | "reject") => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, status: action === "approve" ? "approved" : "rejected" } : review
    ));
    
    toast({
      title: action === "approve" ? "Recensione approvata" : "Recensione rifiutata",
      description: `La recensione è stata ${action === "approve" ? "approvata" : "rifiutata"} con successo.`,
    });
  };

  const handleCommentAction = (id: string, action: "approve" | "reject") => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: action === "approve" ? "approved" : "rejected" } : comment
    ));
    
    toast({
      title: action === "approve" ? "Commento approvato" : "Commento rifiutato",
      description: `Il commento è stato ${action === "approve" ? "approvato" : "rifiutato"} con successo.`,
    });
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      toast({
        title: "Errore",
        description: "Inserisci un indirizzo email valido",
        variant: "destructive",
      });
      return;
    }

    const newAdmin = {
      id: (admins.length + 1).toString(),
      email: newAdminEmail,
      dateAdded: new Date().toISOString().split("T")[0],
    };

    setAdmins([...admins, newAdmin]);
    setNewAdminEmail("");
    
    toast({
      title: "Amministratore aggiunto",
      description: "Il nuovo amministratore è stato aggiunto con successo.",
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Area Amministrazione</h1>
      
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList>
          <TabsTrigger value="reviews">Recensioni</TabsTrigger>
          <TabsTrigger value="comments">Commenti</TabsTrigger>
          <TabsTrigger value="admins">Amministratori</TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notifiche
            {notifications.some(n => !n.read) && (
              <Badge variant="destructive" className="ml-2">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Autore</TableHead>
                  <TableHead>Patologia</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.title}</TableCell>
                    <TableCell>{review.author}</TableCell>
                    <TableCell>{review.condition}</TableCell>
                    <TableCell>{review.date}</TableCell>
                    <TableCell>
                      <Badge variant={review.status === "approved" ? "default" : "secondary"}>
                        {review.status === "approved" ? "Approvata" : "In attesa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewAction(review.id, "approve")}
                          disabled={review.status === "approved"}
                        >
                          Approva
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReviewAction(review.id, "reject")}
                          disabled={review.status === "rejected"}
                        >
                          Rifiuta
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contenuto</TableHead>
                  <TableHead>Autore</TableHead>
                  <TableHead>Recensione</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                    <TableCell>{comment.author}</TableCell>
                    <TableCell>{comment.reviewTitle}</TableCell>
                    <TableCell>{comment.date}</TableCell>
                    <TableCell>
                      <Badge variant={comment.status === "approved" ? "default" : "secondary"}>
                        {comment.status === "approved" ? "Approvato" : "In attesa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCommentAction(comment.id, "approve")}
                          disabled={comment.status === "approved"}
                        >
                          Approva
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCommentAction(comment.id, "reject")}
                          disabled={comment.status === "rejected"}
                        >
                          Rifiuta
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="admins">
          <div className="space-y-6">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Email del nuovo amministratore"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="max-w-md"
              />
              <Button onClick={handleAddAdmin}>Aggiungi Amministratore</Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Data Aggiunta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.dateAdded}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read ? 'bg-gray-50' : 'bg-white'
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="font-semibold">{notification.title}</h3>
                  {!notification.read && (
                    <Badge variant="default" className="ml-auto">
                      Nuovo
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{notification.content}</p>
                <p className="text-sm text-gray-500 mt-2">{notification.date}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;