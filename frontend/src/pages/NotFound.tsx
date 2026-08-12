import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center p-8">
      <AlertCircle className="w-16 h-16 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved. Please check the URL or navigate back to the dashboard.
      </p>
        <Link to="/">
          <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-sm">
            Return to Dashboard
          </Button>
        </Link>
    </div>
  );
}
