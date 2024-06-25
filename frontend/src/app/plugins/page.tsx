import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
// import { MailIcon, PhoneIcon } from "@heroicons/react/solid";
import ExtensionsGrid from "@/components/Extensions/ExtensionsGrid";
import { act } from "react-dom/test-utils";

export const metadata: Metadata = {
  title: "AutoAnys | Plugins & Extensions",
  description: "AutoAnys, Automate Anything. Plugins & Extensions",
};

const Plugins = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Plugins & Extensions" />

        <ExtensionsGrid />
      </div>

      {/* <ExtensionsGrid /> */}
    </DefaultLayout>
  );
};

export default Plugins;
