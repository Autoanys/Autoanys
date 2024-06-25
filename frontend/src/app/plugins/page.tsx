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

const plugins = [
  {
    name: "Browser",
    title: "Chrome Browser Extension",
    role: "Development",
    doc: "www.github.com",
    telephone: "+1-202-555-0170",
    imageUrl: "/images/nodes/chrome_icon.png",
    active: true,
  },
  {
    name: "General",
    title: "General features",
    role: "Development",
    doc: "www.github.com",
    telephone: "+1-202-555-0170",
    imageUrl: "/images/nodes/general_icon.png",
    active: true,
  },
  {
    name: "Excel / CSV",
    title: "Excel / CSV features",
    role: "Development",
    doc: "www.github.com",
    telephone: "+1-202-555-0170",
    imageUrl: "/images/nodes/csv_icon.png",
    active: true,
  },
];

const Plugins = () => {
  // // const [plugin, SetPlugin] = useState([]);

  // // useEffect(() => {
  // const fetchData = async () => {
  //   try {
  //     const res = await fetch(
  //       process.env.NEXT_PUBLIC_BACKEND_URL + "/plugins/",
  //     );
  //     const data = await res.json();
  //     const overviewData = JSON.parse(data);
  //     console.log("TTE", overviewData);
  //     // SetPlugin(overviewData);
  //     console.log("TTE", data.total_workflows);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };
  // // console.log("TTE", plugin);
  // fetchData();
  // console.log("ASD");
  // }, []);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Plugins & Extensions" />

        <ul
          role="list"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
        >
          {plugins.map((plugin) => (
            <li
              key={plugin.name}
              className="col-span-1  divide-y divide-slate-100 rounded-lg bg-white shadow-xl"
            >
              <div className="flex w-full items-center justify-between space-x-6 p-6">
                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-gray-900 truncate text-sm font-medium">
                      {plugin.name}
                    </h3>
                    {/* <span className="inline-block flex-shrink-0 rounded-full bg-red px-2 py-0.5 text-xs font-medium text-green-800">
                      {plugin.role}
                    </span> */}
                  </div>
                  <p className="text-gray-500 mt-1 truncate text-sm">
                    {plugin.title}
                  </p>
                </div>
                <img
                  className="bg-gray-300 h-10 w-10 flex-shrink-0 rounded-full"
                  src={plugin.imageUrl}
                  alt=""
                />
              </div>
              <div className="grid grid-cols-2">
                <div className="divide-gray-200 col-span-1 -mt-px flex">
                  <div className="flex w-0 flex-1">
                    <a
                      href={`mailto:${plugin.doc}`}
                      className="text-gray-700 hover:text-gray-500 relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium"
                    >
                      {/* <MailIcon
                        className="text-gray-400 h-5 w-5"
                        aria-hidden="true"
                      /> */}

                      <svg
                        fill="#000000"
                        width="20px"
                        height="20px"
                        viewBox="-274.15 0 1200 1200"
                        xmlns="http://www.w3.org/2000/svg"
                        className="cf-icon-svg"
                      >
                        <path d="M30 161c-16.5 0-30 13.5-30 30v827.8c0 16.5 13.5 30 30 30h591.7c16.5 0 30-13.5 30-30V343.7L469 161H30zm389.6 60v134.8c0 19.9 16.3 36.2 36.2 36.2h135.9v596.8H60V221h359.6z" />
                        <path d="M123.8 768.6h394.8v50H123.8zm0-124.6h394.8v50H123.8zm0-124.5h394.8v50H123.8z" />
                        <circle cx="194" cy="382.3" r="60" />
                      </svg>

                      <span className="ml-3">Docs</span>
                    </a>
                  </div>
                </div>

                <div className="col-span-1 m-auto flex cursor-pointer items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={plugin.active}
                      className="sr-only"
                    />
                    <div
                      className={`block border border-slate-200 ${plugin.active ? "bg-green-500" : "bg-slate-500"} h-6 w-12 rounded-full`}
                    ></div>
                    <div
                      className={`dot  absolute top-1 h-5 w-5 rounded-full transition ${plugin.active ? "translate-x-6" : "translate-x-0"}`}
                    ></div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* <ExtensionsGrid /> */}
    </DefaultLayout>
  );
};

export default Plugins;
