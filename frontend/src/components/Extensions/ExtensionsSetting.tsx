"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import { Fragment } from "react";
import {
  ExclamationCircleIcon,
  XIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";
import { Transition } from "@headlessui/react";

const profiles = [
  {
    id: 1,
    name: "Profile 1",
    email: "email1@example.com",
    smtp: "smtp1.example.com",
    port: 587,
  },
  {
    id: 2,
    name: "Profile 2",
    email: "email2@example.com",
    smtp: "smtp2.example.com",
    port: 465,
  },
];

const ExtensionsSetting = (pluginID) => {
  const [plugins, setPlugins] = useState([]);
  const [configInput, setConfigInput] = useState([]);
  const [resultLoading, setResultLoading] = useState(true);
  const [showNotification, setShowNotification] = useState({
    show: false,
    code: 200,
    message: "",
  });

  const [selectedProfile, setSelectedProfile] = useState(profiles[0]);

  const notify = async (code, message) => {
    setShowNotification({
      show: true,
      code: code,
      message: message,
    });
    setTimeout(() => {
      setShowNotification({
        show: false,
        code: 200,
        message: "",
      });
    }, 3000);
  };

  const parms = useSearchParams();

  useEffect(() => {
    const fetchDatas = async () => {
      setResultLoading(true);
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/plugins/" + parms.get("id"),
          {
            method: "GET",
          },
        );

        const data = await res.json();
        const fixJsonArray = data.plugin.settingInputJson;
        const validConfigInputString = fixJsonArray
          .replace(/([{,])(\s*)(\w+)\s*:/g, '$1"$3":')
          .replace(/:\s*([^,"}\s]+)/g, ': "$1"');

        const configInputFix = JSON.parse(validConfigInputString);

        setConfigInput(configInputFix);
        console.log(
          "This is data plugin setting",
          data.plugin.settingInputJson,
        );
        setPlugins(data.plugin);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDatas().then(() => {
      setResultLoading(false);
    });
  }, []);

  return (
    <div className=" flex h-[calc(100vh-200px)] p-4">
      <div className="flex h-full w-1/3  flex-col rounded-lg bg-white p-4 shadow-xl dark:bg-boxdark">
        <button className="mb-4 w-full rounded-lg bg-blue-500 px-4 py-2 text-white">
          Add Profile
        </button>
        <ul className="flex-1 overflow-auto">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className={`cursor-pointer rounded-lg p-2 ${selectedProfile.id === profile.id ? "bg-blue-100 dark:bg-meta-4" : ""}`}
              onClick={() => setSelectedProfile(profile)}
            >
              {profile.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex h-full w-2/3 flex-col rounded-lg bg-white p-4 shadow-xl dark:bg-boxdark">
        <h2 className="mb-4 text-xl font-bold">Profile Details</h2>
        {configInput.map((input) => (
          <div className="mb-4">
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor={input.name}
            >
              {input.label}
            </label>
            <input
              type={input.type}
              id={input.name}
              className="w-full rounded-lg border p-2"
              value={input.value}
            />
          </div>
        ))}

        {/* <div className="mb-4">
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full rounded-lg border p-2"
            value={selectedProfile.email}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium" htmlFor="smtp">
            SMTP Server Address
          </label>
          <input
            type="text"
            id="smtp"
            className="w-full rounded-lg border p-2"
            value={selectedProfile.smtp}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium" htmlFor="port">
            Port
          </label>
          <input
            type="number"
            id="port"
            className="w-full rounded-lg border p-2"
            value={selectedProfile.port}
            readOnly
          />
        </div> */}
      </div>
    </div>
  );
};

export default ExtensionsSetting;
