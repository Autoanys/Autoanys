import React, { Fragment, useState } from "react";
import { ExclamationCircleIcon, XIcon } from "@heroicons/react/outline";
import { Transition } from "@headlessui/react";

const Notification = ({ showNotification, setShowNotification }) => {
  <div
    aria-live="assertive"
    className="pointer-events-none fixed inset-0 z-999 mt-30 flex items-end px-4 py-6 sm:items-start sm:p-6"
  >
    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
      <Transition
        show={showNotification.show}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon
                  className="h-6 w-6 text-red"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-red">
                  {showNotification.code}
                </p>
                <p className="text-gray-500 mt-1 text-sm">
                  {showNotification.message}
                </p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  className="text-gray-400 hover:text-gray-500 inline-flex rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => {
                    setShowNotification({
                      show: false,
                      code: 200,
                      message: "",
                    });
                  }}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>;
};

export default Notification;
