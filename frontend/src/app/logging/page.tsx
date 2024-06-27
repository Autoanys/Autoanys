import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import LoggingTable from "@/components/Tables/LoggingTable";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Logging ",
  description: "AutoAnys, Automate Anything. Logging",
};

const Logging = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="logging" />
      <div className="flex flex-col gap-10">
        <LoggingTable />
      </div>
    </DefaultLayout>
  );
};

export default Logging;
