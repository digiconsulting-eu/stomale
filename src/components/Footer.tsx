import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <div className="space-y-1 text-text-light">
              <p>Stomale.info</p>
              <p>Gestito da DigiConsulting</p>
              <p>P.IVA IT03720290364</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/cookie-policy" className="text-text-light hover:text-primary">
              Cookie Policy
            </Link>
            <Link to="/privacy-policy" className="text-text-light hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-text-light hover:text-primary">
              Termini e Condizioni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;