'use server';

import TagCard from "@/components/cards/TagCard";
import { Preview } from "@/components/editor/Preview";
import Metric from "@/components/Metric";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routes";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { getQuestion, incrementViews } from "@/lib/actions/question.action";
import { redirect } from "next/navigation";
import { after } from "next/server";
import AnswerForm from "@/components/forms/AnswerForm";
import { getAnswers } from "@/lib/actions/answer.action";
import AllAnswers from "@/components/answers/AllAnswers";
import Votes from "@/components/votes/Votes";

const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const { success, data: question } = await getQuestion({ questionId: id });

  after(async () => {
    // VIEW COUNT qilishni 3- usuli va optimal usuli, chunki bu usulda view increment qilishni question ma'lumotlarini olib, UI render qilingandan keyin qilamiz, shuning uchun agar question ma'lumotlarini olishda xatolik yuz bersa, view increment qilishni amalga oshirmaymiz, bu esa noto'g'ri view sonini oldini oladi.
    await incrementViews({ questionId: id });
  });

  // VIEW COUNT qilishni 2- usuli
  // parallel request when one doesn't depend on the other
  // const [_, { success, data: question }] = await Promise.all([ //_ is used to ignore the first promise result, which is the result of incrementViews, because we don't need to use it in this component. We only care about the result of getQuestion, which is the second promise.
  // await incrementViews({ questionId: id }), // bu yerda view increment qilishni alohida qilamiz, chunki bu har doim bo'lishi kerak va foydalanuvchi sahifani har safar ochganda view soni oshishi kerak.
  // await getQuestion({ questionId: id }), // bu yerda esa question ma'lumotlarini olishni alohida qilamiz, chunki bu ma'lumotlar sahifada ko'rsatiladi va foydalanuvchi uchun kerak bo'ladi.
  // ]);

  if (!success || !question) {
    return redirect("/404");
  }

  // fetch answers
  const {
    success: areAnswersLoaded,
    data: answersResult,
    error: answersError,
  } = await getAnswers({
    questionId: id,
    page: 1,
    pageSize: 10,
    filter: "latest",
  });

  console.log("ANSWERS", answersResult);

  // Fetch real data
  const { author, createdAt, answers, views, tags, content, title } = question;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>

          <div className="flex justify-end">
            <Votes
              upvotes={question.upvotes}
              downvotes={question.downvotes}
              hasupVoted={true}
              hasdownVoted={false}
            />
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <TagCard
            key={tag._id}
            _id={tag._id as string}
            name={tag.name}
            compact
          />
        ))}
      </div>

      <section className="my-5">
        <AllAnswers
          data={answersResult?.answers}
          success={areAnswersLoaded}
          error={answersError}
          totalAnswers={answersResult?.totalAnswers || 0}
        />
      </section>

      <AnswerForm
        questionId={question._id}
        questionTitle={question.title}
        questionContent={question.content}
      />
    </>
  );
};

export default QuestionDetails;
