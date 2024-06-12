import SubFlowCanva from "@/components/SubFlowCanva/SubFlowCanva";
// import { useRouter } from "next/router";
import ComponentsEditor from "@/components/ComponentsEditor/ComponentsEditor";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "AutoAnys | Edit Component",
  description: "AutoAnys, Automate Anything. Edit Component",
};
import {
  useSignal,
  useComputed,
  useSignalEffect,
  signal,
  effect,
} from "@preact/signals";

const codingValue = signal("");
const componentInfo = signal({
  component_name: "test",
  component_category: "test",
  component_description: "test",
});

const ComponentEdit = (flowid) => {
  // const router = useRouter();
  // const { flowid } = router.query;

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-10">
        {/* <p>ASD</p> */}

        {/* <p>{flowid}</p> */}

        <ComponentsEditor
          editing={true}
          componentID={flowid}
          getCodingValue={codingValue}
          getComponentInfo={componentInfo}
        />
      </div>
    </DefaultLayout>
  );
};

export default ComponentEdit;
