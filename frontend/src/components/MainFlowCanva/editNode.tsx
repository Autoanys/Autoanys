import React from "react";

const editNode = ({ nodes, node_id, onUpdate }) => {
  // Function to handle input change and call parent's update function
  const handleChangeEditNode = (e) => {
    const { name, value } = e.target;
    onUpdate(name, value);
  };

  return (
      <div>
        <p className=" pt-4 font-medium">
          {" "}
          Node Label : {nodes.find((n) => n.id == node_id)?.data.label}
        </p>
        <p className="pb-4  font-medium">
          {" "}
          Node Type : {nodes.find((n) => n.id == node_id)?.type}
        </p>

        <p>
          {nodes?.find((n) => n.id == node_id)?.data.inputs?.length > 0 &&
            nodes
              .find((n) => n.id == node_id)
              ?.data.inputs.map((input) => {
                return (
                  <div>
                    <span className="font-medium">{input.label}</span>
                    {input.type === "select" ? (
                      <select
                        id={input.id}
                        key={`${node_id}-${input.label}`}
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={input.value}
                        onChange={(e) => changeNodeValue(e, node_id, input.id)}
                      >
                        {Array.isArray(input.value) ? (
                          input.value.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))
                        ) : (
                          <option key={input.value} value={input.value}>
                            {input.value}
                          </option>
                        )}
                      </select>
                    ) : input.type === "file" ? (
                      <div>
                        {file && (
                          <div className="flex ">
                            <p className="">Selected File - {file.name}</p>
                            <TrashIcon
                              onClick={() => setFile(null)}
                              className="h-6 w-6 rounded border p-1 text-red hover:bg-red hover:text-white"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <input
                          id={input.id}
                          key={`${node_id}-${input.label}`}
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                          type="file"
                          {...(input.required ? { required: true } : {})}
                          onChange={(e) => {
                            const selectedFile = e.target.files[0];
                            setFile(selectedFile);
                            changeNodeValue(e, node_id, input.id);
                          }}
                        />
                      </div>
                    ) : input.type === "files" ? (
                      <div>
                        {file && (
                          <div className="flex ">
                            <p className="">Selected File - {file.name}</p>
                            <TrashIcon
                              onClick={() => setFile(null)}
                              className="h-6 w-6 rounded border p-1 text-red hover:bg-red hover:text-white"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <Dropzone onChange={updateFiles} value={files}>
                          {files.map((file) => (
                            <FileMosaic {...file} preview />
                          ))}
                        </Dropzone>
                      </div>
                    ) : (
                      <input
                        id={input.id}
                        key={`${node_id}-${input.label}`}
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                        type={input.type}
                        {...(input.required ? { required: true } : {})}
                        placeholder={input.placeholder}
                        defaultValue={input.value}
                        value={input.value}
                        onChange={(e) => changeNodeValue(e, node_id, input.id)}
                      />
                    )}
                  </div>
                );
              })}
        </p>

        <br></br>
        <br></br>
      </div>
    </div>
  );
};

export default editNode;
