import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";

const Home = async () => {
  const questions = [
    {
      _id: "1",
      title: "How to learn JavaScript?",
      description:
        "I am new to programming and want to learn JavaScript. Any suggestions?",
      tags: [
        { _id: "t1", name: "JavaScript" },
        { _id: "t2", name: "Programming" },
      ],
      author: { _id: "1", name: "John Doe" },
      upvotes: 10,
      answers: 2,
      views: 150,
      createdAt: new Date(),
    },
    {
      _id: "2",
      title: "How to learn React?",
      description:
        "I am new to programming and want to learn JavaScript. Any suggestions?",
      tags: [
        { _id: "t1", name: "JavaScript" },
        { _id: "t2", name: "Programming" },
      ],
      author: { _id: "1", name: "John Doe" },
      upvotes: 10,
      answers: 2,
      views: 150,
      createdAt: new Date(),
    },
  ];
  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION} className="max-sm:w-full">
            Ask a Question
          </Link>
        </Button>
      </section>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
          route="/" //it has to know where it is
        />
      </section>
      HomeFilter
      
      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.map((question) => (
          <div
            key={question._id}
            className="rounded-[10px] bg-light-100_darkgradient p-6"
          >
            <h2 className="h2-semibold mb-2 text-dark100_light900">
              {question.title}
            </h2>
            <p className="body-regular mb-4 text-dark200_light800">
              {question.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="body-regular rounded-full bg-light-200_dark300 px-3 py-1 text-dark300_light700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
