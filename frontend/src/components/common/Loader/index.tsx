const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
      <img
        className="h-16 w-16"
        src={"/images/general/loader.gif"}
        alt="loader"
      />
      {/* <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div> */}
    </div>
  );
};

export default Loader;
