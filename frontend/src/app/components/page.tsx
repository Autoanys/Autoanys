import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ComponentTable from "@/components/Tables/ComponentTable";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Components ",
  description: "AutoAnys, Automate Anything. Components",
};

const Components = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="component" newComponent="true" />
      <div className="flex flex-col gap-10">
        <ComponentTable />
      </div>
    </DefaultLayout>
  );
};

export default Components;
