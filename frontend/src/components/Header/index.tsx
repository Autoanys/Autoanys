import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");

  const suggestions = [
    { label: "Create Flow", path: "/subflowdraw" },
    { label: "Multi-Flow Table", path: "/mainflow" },
    { label: "Flow Table", path: "/subflow" },
    { label: "Logging", path: "/logging" },
    { label: "Settings", path: "/settings" },
    { label: "Components", path: "/customcomponents" },
    { label: "Plugins & Extensions", path: "/plugins" },
  ];

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleSelect = async (path) => {
    setInputValue("");
    setIsPromptVisible(false);
    console.log("Good", path);
    await router.push(path, { scroll: false });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsPromptVisible(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredSuggestions.length > 0) {
      handleSelect(filteredSuggestions[0].path);
    }
  };

  const togglePopup = () => {
    setShowInfoBox(!showInfoBox);
  };
  useHotkeys("ctrl+k, cmd+k", (event) => {
    event.preventDefault();
    if (inputRef.current) {
      inputRef.current.focus();
      setIsPromptVisible(true);
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsPromptVisible(false);
      }
    };

    const handleEsc = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        setIsPromptVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

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

        <div className="hidden rounded-lg sm:block">
          <div className="relative  rounded-lg">
            <div className="relative rounded-lg">
              <div className="relative flex items-center rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500 absolute left-3 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Type to search..."
                  className="w-72 rounded-lg border border-slate-300 bg-white p-2 pl-10 pr-4 font-medium hover:border-slate-500 focus:border-slate-500 focus:outline-none"
                  value={inputValue}
                  ref={inputRef}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsPromptVisible(true)}
                />
                <div className="text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 transform">
                  {navigator.platform.includes("Mac") ? (
                    <div className="ml-2">
                      <span className="rounded-lg border pl-2 pr-2">CMD</span>
                      
                      <span className="r ml-1">+</span>
                      <span className="ml-1 rounded-lg border pl-2 pr-2">
                        K
                      </span>
                    </div>
                  ) : (
                    <div className="ml-2">
                      <span className="rounded-lg border pl-2 pr-2">Ctrl</span>
                      <span className="r ml-1">+</span>
                      <span className="ml-1 rounded-lg border pl-2 pr-2">
                        K
                      </span>
                    </div>
                  )}
                </div>
                {isPromptVisible && inputValue && (
                  <div className="border-gray-300 absolute left-0 top-full z-10 w-full border bg-white  shadow-lg">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((suggestion, index) => (
                        // <Link href={suggestion.path}>
                        <p
                          key={suggestion.path}
                          className={`text-gray-700 hover:bg-gray-200 cursor-pointer p-2 ${index === 0 ? "bg-slate-200" : ""}`}
                          // onClick={() => handleSelect(suggestion.path)}
                          onClick={() => {
                            console.log("Click detected");
                            handleSelect(suggestion.path);
                          }}
                        >
                          {suggestion.label}
                        </p>
                        // </Link>
                      ))
                    ) : (
                      <p className="text-gray-700">No results found</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
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
