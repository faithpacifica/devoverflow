import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";

const questions = [
  {
    _id: "1",
    title: "How to learn JavaScript?",
    description:
      "I am new to programming and want to learn JavaScript. Any suggestions?",
    tags: [
      { _id: "1", name: "javascript" },
      { _id: "2", name: "Programming" },
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
      { _id: "1", name: "React" },
      { _id: "2", name: "Programming" },
    ],
    author: { _id: "1", name: "John Doe" },
    upvotes: 10,
    answers: 2,
    views: 150,
    createdAt: new Date(),
  },
];

interface SearchParams {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
const Home = async ({ searchParams }: SearchParams) => {
   const params = await searchParams;

   const query = params.query ?? "";
   const filter = params.filter ?? "";

  const filteredQuestions = questions.filter((question) => {
    const matchesQuery = question.title
      .toLowerCase()
      .includes(query?.toLowerCase());
      
    const matchesFilter = filter
      ? question.tags[0].name?.toLowerCase() === filter.toLowerCase()
      : true;
    return matchesQuery && matchesFilter;
  });

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

      <HomeFilter />

      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestions.map((question) => (
          <div key={question._id}>
            <h2 className="h2-medium mb-2 text-dark100_light900">
              {question.title}
            </h2>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
