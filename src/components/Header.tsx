import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          StoMale
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex space-x-4">
            <NavigationMenuItem>
              <Link to="/recensioni" className="text-text hover:text-primary transition-colors px-3 py-2">
                Leggi le recensioni
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/nuova-recensione" className="text-text hover:text-primary transition-colors px-3 py-2">
                Racconta la tua esperienza
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/cerca-patologia" className="text-text hover:text-primary transition-colors px-3 py-2">
                Cerca patologia
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/cerca-sintomi" className="text-text hover:text-primary transition-colors px-3 py-2">
                Cerca Sintomi
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/patologie" className="text-text hover:text-primary transition-colors px-3 py-2">
                Elenco Patologie
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/inserisci-patologia" className="text-text hover:text-primary transition-colors px-3 py-2">
                Inserisci Patologia
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/blog" className="text-text hover:text-primary transition-colors px-3 py-2">
                Blog
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/login">Accedi</Link>
          </Button>
          <Button asChild>
            <Link to="/registrati">Registrati</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};