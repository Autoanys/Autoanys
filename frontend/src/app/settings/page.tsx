import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
// import SelectGroupOne from "@/components/SelectGroup/SelectGroupOne";
import SelectLanguage from "@/components/SelectGroup/SelectLanguage";
import SelectAuthorization from "@/components/SelectGroup/SelectAuthorization";

import { env } from "process";

export const metadata: Metadata = {
  title: "AutoAnys | Settings",
  description: "AutoAnys, Automate Anything. Settings",
};

const Settings = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />
        <div className="m-auto grid w-5/6 grid-cols-1">
          <div className="flex flex-col gap-9">
            {/* <!-- Contact Form --> */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Settings
                </h3>
              </div>
              <form action="#">
                <div className="p-6.5">
                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2 ">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Backend Endpoint (.env){" "}
                        <span className="text-meta-1">*</span>
                      </label>
                      <div className="cursor-not-allowed">
                        <input
                          type="text"
                          value={env.NEXT_PUBLIC_BACKEND_URL}
                          className="ursor-not-allowed	 w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary "
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <SelectLanguage />
                  <SelectAuthorization />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Settings;
