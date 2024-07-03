"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";

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
  const { t } = useTranslation("common");
  const [isBackendFailed, setBackendFailed] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const fetchBackend = () => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (isLoading) {
        setBackendFailed(true);
        setLoading(false);
      }
    }, 10000);

    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setBackendFailed(true);
      })
      .finally(() => {
        clearTimeout(timer);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBackend();
  }, []);

  const retry = () => {
    location.reload();
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {isBackendFailed && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black bg-opacity-75 p-4 text-white">
          <h2 className="mb-2 text-xl font-semibold">
            🚨 Failed Connecting to the Backend
          </h2>
          <p className="mb-1 text-sm">
            Please check if the service below is available:
          </p>
          <p className="font-mono rounded bg-white bg-opacity-10 p-2 text-sm text-white">
            {process.env.NEXT_PUBLIC_BACKEND_URL}
          </p>
          <button
            onClick={retry}
            className="mt-4 border border-white px-5 py-2.5 text-lg transition-colors duration-150 hover:bg-white hover:text-black"
          >
            Retry
          </button>
        </div>
      )}

      <h5 className=" font-semibold text-black dark:text-white">
        {t(pageName)}
      </h5>
      <nav>
        <ol className="flex items-center gap-2">
          {newSubFlow && (
            <div className="flex gap-x-4">
              <Link
                href="/subflowdraw"
                className="group relative flex items-center gap-2.5 rounded-lg px-4 py-4 text-sm font-medium font-semibold text-black duration-300 ease-in-out dark:hover:bg-meta-4"
              >
                <button className="font hover:bg-blue rounded-full bg-blue-400 px-4 py-2 text-white hover:bg-blue-500 hover:shadow-2xl">
                  Create New Flow
                </button>
              </Link>
            </div>
          )}

          {newMainFlow && (
            <Link
              href="/mainflowdraw"
              className={`bold disabled group pointer-events-none relative flex items-center gap-2.5  rounded-lg px-4	py-4
             text-sm font-medium font-semibold text-black duration-300 ease-in-out
             dark:hover:bg-meta-4`}
            >
              <p>Currently this feature is disabled</p>
              <button className="disabled font hover:bg-blue cursor-not-allowed rounded-full bg-slate-400 px-4 py-2 text-white hover:bg-blue-500 hover:shadow-2xl">
                Create Multi-Flows
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
          <li className="font-medium text-primary">{t(pageName)}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
