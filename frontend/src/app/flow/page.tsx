import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import FlowTable from "@/components/Tables/FlowTable";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Flow",
  description: "AutoAnys, Automate Anything. Flow",
};

const SubFlow = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="flow" newSubFlow="true" />
      <div className="flex flex-col gap-10">
        <FlowTable />
      </div>
    </DefaultLayout>
  );
};

export default SubFlow;
