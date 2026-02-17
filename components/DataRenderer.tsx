import Image from "next/image";
import Link from "next/link";
import React from "react";

import { DEFAULT_EMPTY, DEFAULT_ERROR } from "@/constants/states";

import { Button } from "./ui/button";

interface Props<T> { // T is type safe when we pass different types of data and we dont know what type of data will be passed
  success: boolean;
  error?: {
    message: string;
    details?: Record<string, string[]>; // Record bu yerda object ni bildiradi, bunda key string va value string array buladi
  };
  data: T[] | null | undefined;
  empty: {
    title: string;
    message: string;
    button?: {
      text: string;
      href: string;
    };
  };
  render: (data: T[]) => React.ReactNode; // React.ReactNode bu yerda return qilinadigan elementlarni bildiradi
}

interface StateSkeletonProps {
  image: {
    light: string;
    dark: string;
    alt: string;
  };
  title: string;
  message: string;
  button?: {
    text: string;
    href: string;
  };
}

const StateSkeleton = ({
  image,
  title,
  message,
  button,
}: StateSkeletonProps) => (
  <div className="mt-16 flex w-full flex-col items-center justify-center sm:mt-36">
    <>
      <Image
        src={image.dark}
        alt={image.alt}
        width={270}
        height={200}
        className="hidden object-contain dark:block"
      />
      <Image
        src={image.light}
        alt={image.alt}
        width={270}
        height={200}
        className="block object-contain dark:hidden"
      />
    </>

    <h2 className="h2-bold text-dark200_light900 mt-8">{title}</h2>
    <p className="body-regular text-dark500_light700 my-3.5 max-w-md text-center">
      {message}
    </p>
    {button && (
      <Link href={button.href}>
        <Button className="paragraph-medium mt-5 min-h-[46px] rounded-[10px] bg-primary-500 px-4 py-3 text-light-900 hover:bg-primary-500">
          {button.text}
        </Button>
      </Link>
    )}
  </div>
);

const DataRenderer = <T,>({// <T> nega bunday yozildi: Props<T>  degan ma'noda
  success,
  error,
  data,
  empty = DEFAULT_EMPTY,
  render, // render bu yerda function ni bildiradi
}: Props<T>) => {
  if (!success) {
    return (
      <StateSkeleton
        image={{
          light: "/images/light-error.png",
          dark: "/images/dark-error.png",
          alt: "Error state illustration",
        }}
        title={error?.message || DEFAULT_ERROR.title} // agar error.message bulmasa DEFAULT_ERROR.title ni korsatadi
        message={
          error?.details
            ? JSON.stringify(error.details, null, 2) // NULL,2 bu yerda JSON string ni formatlash uchun ishlatiladi ,2 bu yerda 2 ta space bilan formatlanadi
            : DEFAULT_ERROR.message 
        }
        button={empty.button}
      />
    );
  }

  if (!data || data.length === 0)
    return (
      <StateSkeleton
        image={{
          light: "/images/light-illustration.png",
          dark: "/images/dark-illustration.png",
          alt: "Empty state illustration",
        }}
        title={empty.title}
        message={empty.message}
        button={empty.button}
      />
    );

  return <div>{render(data)}</div>; // agar data bulsa render function ni chaqiradi va data ni uzatadi ,masalan: real misolda QuestionCard ga data ni uzatadi
};

export default DataRenderer;
