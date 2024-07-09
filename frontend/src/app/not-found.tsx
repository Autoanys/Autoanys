import Link from "next/link";

const retry = () => {
  location.reload();
};

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <img
        src={"/images/logo/newLogo.png"}
        alt={"logo"}
        className={"mb-4 h-8 w-50"}
      />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-2xl">Page not found</p>
      <a className="text-blue-500" href="/">
        Go back to home
      </a>
    </div>
  );
}
