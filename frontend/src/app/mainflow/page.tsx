import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import MainflowTable from "@/components/Tables/MainflowTable";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Main Flows",
  description: "AutoAnys, Automate Anything. Main Flows",
};

const MainFlow = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Main Flows" newMainFlow="true" />
      <div className="flex flex-col gap-10">
        <MainflowTable />
      </div>
    </DefaultLayout>
  );
};

export default MainFlow;
