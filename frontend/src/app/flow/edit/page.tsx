import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";
import SubFlowCanva from "@/components/SubFlowCanva/SubFlowCanva";
// import { useRouter } from "next/router";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Edit Sub Flow",
  description: "AutoAnys, Automate Anything. Create Sub Flow",
};

const SubFlowEdit = (flowid) => {
  // const router = useRouter();
  // const { flowid } = router.query;

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-10">
        {/* <p>ASD</p> */}

        {/* <p>{flowid}</p> */}

        <SubFlowCanva editing={true} flowid={flowid} />
      </div>
    </DefaultLayout>
  );
};

export default SubFlowEdit;
