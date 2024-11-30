import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, User, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/logo.png";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    navigate('/');
    window.location.reload();
  };

  const renderAuthButtons = () => {
    if (isLoggedIn) {
      return (
        <>
          {isAdmin ? (
            <Button variant="ghost" asChild className="flex items-center gap-2 hover:bg-primary/10">
              <Link to="/admin">
                <ShieldCheck size={18} className="text-primary" />
                Admin Dashboard
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" asChild className="flex items-center gap-2 hover:bg-primary/10">
              <Link to="/dashboard">
                <User size={18} className="text-primary" />
                Dashboard
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
            Logout
          </Button>
        </>
      );
    }
    return (
      <>
        <Button variant="ghost" asChild className="hover:bg-primary/10">
          <Link to="/login">Accedi</Link>
        </Button>
        <Button asChild className="bg-primary hover:bg-primary-hover">
          <Link to="/registrati">Registrati</Link>
        </Button>
      </>
    );
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <img src={logo} alt="StoMale.info" className="h-8" />
          </Link>

          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/recensioni" className="text-text hover:text-primary transition-colors font-medium">
              Leggi le recensioni
            </Link>
            <Link to="/nuova-recensione" className="text-text hover:text-primary transition-colors font-medium">
              Racconta la tua esperienza
            </Link>
            <Link to="/cerca-patologia" className="text-text hover:text-primary transition-colors font-medium">
              Cerca patologia
            </Link>
            <Link to="/cerca-sintomi" className="text-text hover:text-primary transition-colors font-medium">
              Cerca Sintomi
            </Link>
            <Link to="/inserisci-patologia" className="text-text hover:text-primary transition-colors font-medium">
              Inserisci Patologia
            </Link>
            <Link to="/blog" className="text-text hover:text-primary transition-colors font-medium">
              Blog
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {renderAuthButtons()}
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/recensioni"
                className="text-text hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Leggi le recensioni
              </Link>
              <Link
                to="/nuova-recensione"
                className="text-text hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Racconta la tua esperienza
              </Link>
              <Link
                to="/cerca-patologia"
                className="text-text hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Cerca patologia
              </Link>
              <Link
                to="/cerca-sintomi"
                className="text-text hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Cerca Sintomi
              </Link>
              <Link
                to="/inserisci-patologia"
                className="text-text hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Inserisci Patologia
              </Link>
              <Link
                to="/blog"
                className="text-text hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Blog
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {isLoggedIn ? (
                  <>
                    {isAdmin ? (
                      <Button variant="ghost" asChild className="flex items-center gap-2 justify-start">
                        <Link to="/admin" onClick={toggleMenu}>
                          <ShieldCheck size={18} className="text-primary" />
                          Admin Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" asChild className="flex items-center gap-2 justify-start">
                        <Link to="/dashboard" onClick={toggleMenu}>
                          <User size={18} className="text-primary" />
                          Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={handleLogout}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="hover:bg-primary/10">
                      <Link to="/login" onClick={toggleMenu}>Accedi</Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary-hover">
                      <Link to="/registrati" onClick={toggleMenu}>Registrati</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};