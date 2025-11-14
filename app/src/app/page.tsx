import { PageTemplate } from "@/components/admin/page-template";
import Auth0Login from "@/components/auth0-login";

const HomePage = () => {
  return (
    <PageTemplate title="">
      {/* Instruction text above the login button */}
      <p className="mb-6 font-sans text-center">
      </p>
      {/* Center the login button and ensure it uses the same font as the rest of the app */}
      <div className="flex justify-center">
        <div className="font-sans">
          <Auth0Login />
        </div>
      </div>
    </PageTemplate>
  );
};

export default HomePage;