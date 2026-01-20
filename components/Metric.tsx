import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  imgUrl: string;
  alt: string;
  value: string | number;
  title: string;
  href?: string;
  textStyles: string;
  imgStyles?: string;
  isAuthor?: boolean;
  titleStyles?: string;
}

const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  href,
  textStyles,
  imgStyles,
  isAuthor,
  titleStyles,
}: Props) => {
  const imageSrc = imgUrl && imgUrl !== "" ? imgUrl : "/icons/avatar.svg";
  const imageAlt = alt && alt !== "" ? alt : "User avatar";

  const metricContent = (
    <>
      <Image
        src={imageSrc}
        width={25}
        height={25}
        alt={imageAlt}
        className={`rounded-full object-cover ${imgStyles}`}
      />

      <p className={`${textStyles} flex items-center gap-1`}>
        {value}

        {title ? (
          <span className={cn(`small-regular line-clamp-1`, titleStyles)}>
            {title}
          </span>
        ) : null}
      </p>
    </>
  );

  return href ? (
    <Link href={href} className="flex-center gap-1">
      {metricContent}
    </Link>
  ) : (
    <div className="flex-center gap-1">{metricContent}</div>
  );
};

export default Metric;
