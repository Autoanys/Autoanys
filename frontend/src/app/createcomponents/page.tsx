import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";
import SubFlowCanva from "@/components/SubFlowCanva/SubFlowCanva";
import ComponentsEditor from "@/components/ComponentsEditor/ComponentsEditor";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Create Components",
  description: "AutoAnys, Automate Anything. Create Components",
};

const CreateComponents = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-10">
        <ComponentsEditor />
      </div>
    </DefaultLayout>
  );
};

export default CreateComponents;
