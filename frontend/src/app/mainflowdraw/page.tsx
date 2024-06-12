import MainflowTable from "@/components/Tables/MainflowTable";
// import SubFlowCanva from "@/components/SubFlowCanva/SubFlowCanva";
import MainFlowCanva from "@/components/MainFlowCanva/MainFlowCanva";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Create Main Flow",
  description: "AutoAnys, Automate Anything. Create Main Flow",
};

const MainFlowDraw = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-10">
        {/* <p>ASD</p> */}

        <MainFlowCanva />
      </div>
    </DefaultLayout>
  );
};

export default MainFlowDraw;
