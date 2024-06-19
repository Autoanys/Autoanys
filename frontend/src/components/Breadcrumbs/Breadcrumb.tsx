"use client";
import Link from "next/link";

interface BreadcrumbProps {
  pageName: string;
  newSubFlow?: string;
  newMainFlow?: string;
  newComponent?: string;
}
const Breadcrumb = ({
  pageName,
  newSubFlow,
  newMainFlow,
  newComponent,
}: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h5 className=" font-semibold text-black dark:text-white">{pageName}</h5>
      <nav>
        <ol className="flex items-center gap-2">
          {newSubFlow && (
            <div className="flex gap-x-4">
              <Link
                href="/subflowdraw"
                className="group relative flex items-center gap-2.5 rounded-lg px-4 py-4 text-sm font-medium font-semibold text-black duration-300 ease-in-out dark:hover:bg-meta-4"
              >
                <button className="font hover:bg-blue rounded-full bg-blue-400 px-4 py-2 text-white hover:bg-blue-500 hover:shadow-2xl">
                  Create New Sub Flow
                </button>
              </Link>
            </div>
          )}

          {newMainFlow && (
            <Link
              href="/mainflowdraw"
              className={`bold } group relative flex items-center gap-2.5  rounded-lg px-4	py-4
             text-sm font-medium font-semibold text-black duration-300 ease-in-out
             dark:hover:bg-meta-4`}
            >
              <button className=" font hover:bg-blue rounded-full bg-blue-400 px-4 py-2 text-white hover:bg-blue-500 hover:shadow-2xl">
                Create Main Flow
              </button>
            </Link>
          )}

          {newComponent && (
            <Link
              href="/createcomponents"
              className={`bold } group relative flex items-center gap-2.5  rounded-lg px-4	py-4
             text-sm font-medium font-semibold text-black duration-300 ease-in-out
             dark:hover:bg-meta-4`}
            >
              <button className=" font hover:bg-blue rounded-full bg-blue-400 px-4 py-2 text-white hover:bg-blue-500 hover:shadow-2xl">
                Create New Component
              </button>
            </Link>
          )}

          <li>
            <Link className="font-medium" href="/">
              Dashboard /
            </Link>
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
