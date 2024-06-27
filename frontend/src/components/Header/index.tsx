import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import { useState } from "react";
import Image from "next/image";
import { useHotkeys } from "react-hotkeys-hook";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const [showInfoBox, setShowInfoBox] = useState(false);

  const togglePopup = () => {
    setShowInfoBox(!showInfoBox);
  };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-slate-50	 drop-shadow-1 dark:bg-[#1A1A29] dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-300"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "delay-400 !w-full"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-[0]"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-200"
                  }`}
                ></span>
              </span>
            </span>
          </button>

          <Link className="block flex-shrink-0 lg:hidden" href="/">
            <Image
              width={32}
              height={32}
              src={"/images/logo/logo-icon.svg"}
              alt="Logo"
            />
          </Link>
        </div>

        <div className="hidden sm:block">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative  rounded-full">
              <button className="border-lg absolute left-0 top-1/2 -translate-y-1/2 pl-5">
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-white p-2 pl-12 pr-4 font-medium focus:outline-none xl:w-125"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex-inline flex items-center gap-2 2xsm:gap-4">
            <a
              rel="nofollow"
              href="https://github.com/autoanys/autoanys"
              className="sub-menu-item flex-inline"
              target="_blank"
            >
              <img
                alt="GitHub Repo stars"
                src="https://img.shields.io/github/stars/autoanys/autoanys"
              />
            </a>

            <DarkModeSwitcher />

            <div
              className="cursor-pointer rounded-lg bg-green-600 px-2 py-1 text-white"
              onClick={togglePopup}
            >
              Community
            </div>
          </ul>
        </div>
        {/* {showInfoBox && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-10">
            <div className="w-2/4 divide-y divide-slate-300 rounded-lg bg-white p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Image
                  width={32}
                  height={32}
                  src={"/images/logo/logo-icon.svg"}
                  alt="Logo"
                />
                <h1 className="text-lg font-bold">Autoanys</h1>

                <div className="flex items-center gap-2">
                  <a
                    target="_blank"
                    href="https://github.com/autoanys/autoanys"
                    className="flex items-center gap-2"
                  >
                    <Image
                      width={24}
                      height={24}
                      src="/images/social/github.svg"
                      alt="GitHub"
                    />
                  </a>
                </div>
                <p>
                  Autoanys is a platform for automating your daily tasks. It is
                  an open-source project and is free to use.
                </p>

                <div className="flex items-center gap-2">
                  <a
                    target="_blank"
                    href="https://autoanys.com"
                    className="flex items-center gap-2"
                  >
                    <Image
                      width={24}
                      height={24}
                      src="/images/social/website.svg"
                      alt="Website"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </header>
  );
};

export default Header;
