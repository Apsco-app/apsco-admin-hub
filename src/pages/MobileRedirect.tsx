import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import apscoLogo from "@/assets/apsco-logo.png";

const MobileRedirect = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center text-primary-foreground">
        <img src={apscoLogo} alt="APSCO" className="h-24 w-24 mx-auto mb-8 filter brightness-0 invert" />
        <h1 className="text-3xl font-bold mb-4">APSCO Mobile App</h1>
        <p className="text-lg opacity-90 mb-8">
          APSCO is available on mobile. Download the app to apply for school admissions.
        </p>
        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            variant="secondary"
            className="w-full h-14 text-lg"
            onClick={() => window.open("https://play.google.com/store", "_blank")}
          >
            <Smartphone className="h-5 w-5 mr-2" />
            Download on Google Play
          </Button>
        </div>
        <p className="text-sm opacity-70 mt-8">
          Are you a school administrator?{" "}
          <a href="/auth/login" className="underline hover:opacity-100">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
};

export default MobileRedirect;
