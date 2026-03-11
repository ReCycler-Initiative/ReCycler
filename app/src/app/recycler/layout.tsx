import Layout from "@/app/organizations/wizard/layout";
import { ReactNode } from "react";

export async function generateMetadata() {
  return {
    title: "ReCycler",
  };
}

const RecyclerLayout = ({ children }: { children: ReactNode }) => {
  return <Layout>{children}</Layout>;
};

export default RecyclerLayout;
