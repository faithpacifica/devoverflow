import { auth } from "@/auth";
import QuestionCard from "@/components/cards/QuestionCard";
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
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
    },
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
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREwEWmFe1Z9ONtQKwNvklC_lXC4E36Br1eJgDwFMtsBNQGPERQuqkjuGdVicS5ElP1EtI&usqp=CAU",
    },
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
const session = await auth()

console.log(session, '-Session')
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
          <QuestionCard key={question._id} question={question} />
        ))}
      </div>
    </>
  );
};

export default Home;
