import { PageTemplate } from "@/components/admin/page-template";
import Auth0Login from "@/components/auth0-login";

const HomePage = () => {
  return (
    <PageTemplate title="">
      <Auth0Login />
    </PageTemplate>
  );
};

export default HomePage;
