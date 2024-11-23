import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold text-primary">
          StoMale
        </a>
        <nav className="flex items-center gap-6">
          <a href="/reviews" className="text-text hover:text-primary transition-colors">
            Recensioni
          </a>
          <a href="/conditions" className="text-text hover:text-primary transition-colors">
            Patologie
          </a>
          <Button variant="outline" className="mr-2">
            Accedi
          </Button>
          <Button>Registrati</Button>
        </nav>
      </div>
    </header>
  );
};