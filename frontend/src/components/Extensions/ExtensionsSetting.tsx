"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

const ExtensionsSetting = (pluginID) => {
  const [plugins, setPlugins] = useState([]);
  const [configInput, setConfigInput] = useState([]);
  const [profiles, setProfiles] = useState([
    { id: 1, name: "Default Name", default: true, input: {} },
  ]);
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
        const fixJsonArray2 = data.plugin.settingArrayJson;
        const validConfigInputArray = fixJsonArray2
          .replace(/([{,])(\s*)(\w+)\s*:/g, '$1"$3":')
          .replace(/:\s*([^,"}\s]+)/g, ': "$1"');

        const configInputFix = JSON.parse(validConfigInputString);
        const configValue = JSON.parse(validConfigInputArray);

        setConfigInput(configInputFix);
        setProfiles(
          configValue.length > 0
            ? configValue
            : [{ id: 1, name: "Profile 1", input: {}, default: true }],
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

  useEffect(() => {
    if (selectedProfile) {
      const updatedProfile = profiles.find(
        (profile) => profile.id === selectedProfile.id,
      );
      if (updatedProfile) {
        setSelectedProfile(updatedProfile);
      }
    }
  }, [profiles]);

  const addProfile = () => {
    setProfiles((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: `Profile ${prev.length + 1}`,
        input: {},
        default: false,
      },
    ]);
    setSelectedProfile({
      id: profiles.length + 1,
      name: `Profile ${profiles.length + 1}`,
      input: {},
      default: false,
    });
  };

  const markDefault = (id) => {
    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === id
          ? { ...profile, default: true }
          : { ...profile, default: false },
      ),
    );
  };

  const deleteProfile = (id) => {
    setProfiles((prev) => prev.filter((profile) => profile.id !== id));
  };

  return (
    <div className=" flex h-[calc(100vh-200px)] p-4">
      <div className="flex h-full w-1/3  flex-col rounded-lg bg-white shadow-xl dark:bg-boxdark">
        <div className="p-4">
          <h2 className="mb-2 flex items-center text-xl font-bold">
            <img src={plugins.imageUrl} className="mr-2 h-5 w-5" alt="plugin" />
            {plugins.name}
          </h2>
          <p className="mb-4">{plugins.title}</p>
          {/* <a target="_blank" href={plugins.doc}>
            ℹ️ Documentation
          </a> */}
          <button
            className="w-full rounded-lg bg-blue-500 p-4 px-4 py-2  text-white"
            onClick={addProfile}
          >
            Add Profile
          </button>
        </div>
        <ul className="flex-1 overflow-auto p-4 ">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className={`cursor-pointer rounded-lg p-2 ${selectedProfile.id === profile.id ? "bg-slate-100	 font-medium dark:bg-meta-4" : ""}`}
              onClick={() => setSelectedProfile(profile)}
            >
              {profile.default && "⭐"} {profile.name}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex justify-between">
          <button
            className="w-1/2 rounded-bl-lg bg-slate-500 px-4 py-2 text-white"
            onClick={() => markDefault(selectedProfile.id)}
          >
            {selectedProfile && selectedProfile.default ? "⭐" : "★"} Default
          </button>
          <button
            className="w-1/2 rounded-br-lg bg-rose-600 px-4 py-2 text-white"
            onClick={() => deleteProfile(selectedProfile.id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
      <div className="flex h-full w-2/3 flex-col rounded-lg bg-white p-4 shadow-xl dark:bg-boxdark">
        <h2 className="mb-4 text-xl font-bold">Profile Details</h2>
        {configInput.length > 0 &&
          configInput.map((input) => (
            <div className="mb-4">
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor={input.name}
              >
                {input.label}
              </label>
              <input
                type={input.type}
                id={selectedProfile.id + input.name}
                className="w-full rounded-lg border p-2"
                value={input.value}
              />
            </div>
          ))}
        <div className="mt-auto flex justify-end ">
          <button className=" rounded-lg bg-blue-500 px-4 py-2 text-white">
            🧪 Test
          </button>
          <button className="ml-2 rounded-lg bg-green-600 px-4 py-2 text-white">
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionsSetting;
