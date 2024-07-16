import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
// import { MailIcon, PhoneIcon } from "@heroicons/react/solid";
import ExtensionsSetting from "@/components/Extensions/ExtensionsSetting";
import { act } from "react-dom/test-utils";

export const metadata: Metadata = {
  title: "AutoAnys | Plugins & Extensions",
  description: "AutoAnys, Automate Anything. Plugins & Extensions",
};

const Plugins = (pluginID) => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Extension_Configuration" />

      <div className="">
        <ExtensionsSetting pluginID={pluginID} />
      </div>
    </DefaultLayout>
  );
};

export default Plugins;
