import Image from "next/image";
import Link from "next/link";
import logo from "../app/recycler-logo.png";

const TitleBar = () => {
  return (
    <header className="pb-2 pl-1 border-b border-gray-400 sticky top-0 bg-white shadow-md z-50">
      <Link href="/">
        <Image src={logo} alt="Recycler logo" width={150} />
      </Link>
    </header>
  );
};

export default TitleBar;
