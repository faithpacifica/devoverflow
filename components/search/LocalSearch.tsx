'use client';
import { Input } from '../ui/input';
import Image from "next/image";

const LocalSearch = ({}:string) => {
  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 `}
    >
      <Image
        src='/icons/search.svg'
        width={24}
        height={24}
        alt="Search"
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder='Search'
        value=''
        onChange={() => {}}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
    </div>
  );
}

export default LocalSearch