"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { formUrlQuery, removeKeysFromUrlQuery} from '@/lib/url';

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  iconPosition: "left" | "right";
  otherClasses?: string;
}

const LocalSearch = ({
  route,
  imgSrc,
  placeholder,
  iconPosition = "left",
  otherClasses,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [search, setSearch] = useState(query || "");
  const previousSearchRef = useRef(search);

  useEffect(() => {
    if (previousSearchRef.current === search) return;

    previousSearchRef.current = search;

    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: search,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, route, pathname, router]);

  // ✅ RETURN shu yerda bo‘lishi kerak
  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && (
        <Image
          src={imgSrc}
          width={24}
          height={24}
          alt="Search"
          className="cursor-pointer"
        />
      )}

      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />

      {iconPosition === "right" && (
        <Image
          src={imgSrc}
          width={15}
          height={15}
          alt="Search"
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default LocalSearch;
