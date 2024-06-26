import Dashboard from "@/components/Dashboard/Dashboard";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { appWithTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18NextConfig from "../../next-i18next.config";

export const metadata: Metadata = {
  title: "AutoAnys | Dashboard",
  description: "AutoAnys, Automate Anything. Dashboard",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Dashboard />
      </DefaultLayout>
    </>
  );
}
