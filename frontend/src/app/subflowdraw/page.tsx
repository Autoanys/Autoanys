import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";
import SubFlowCanva from "@/components/SubFlowCanva/SubFlowCanva";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Create Sub Flow",
  description: "AutoAnys, Automate Anything. Create Sub Flow",
};

const SubFlowDraw = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-10">
        {/* <p>ASD</p> */}

        <SubFlowCanva />
      </div>
    </DefaultLayout>
  );
};

export default SubFlowDraw;
