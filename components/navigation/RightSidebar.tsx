import Image from "next/image";
import Link from "next/link";
import React from "react";
import TagCard from "../cards/TagCard";

const RightSidebar = () => {
  const hotQuestions = [
    { _id: "1", title: "How to learn React?" },
    { _id: "2", title: "What is Next.js?" },
    { _id: "3", title: "Tips for JavaScript beginners" },
    { _id: "4", title: "Understanding TypeScript" },
  ];
  const popularTags = [
    { _id: "1", name: "JavaScript", questions: 1200 },
    { _id: "2", name: "React", questions: 950 },
    { _id: "3", name: "Next.js", questions: 800 },
    { _id: "4", name: "TypeScript", questions: 600 },
  ];

  return (
    <section className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky rigt-0 top-0 flex h-screen w-[350px] overflow-y-auto  flex-col gap-6 border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden  ">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map(({ _id, title }) => (
            <Link
              href={`ROUTES.PROFILE(_id)`}
              key={_id}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">{title}</p>
              <Image
                src="/icons/chevron-right.svg"
                alt="chevron"
                height={20}
                width={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map(({ _id, name, questions }) => (
            <TagCard
              key={_id}
              _id={_id}
              name={name}
              questions={questions}
              showCount={true}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
