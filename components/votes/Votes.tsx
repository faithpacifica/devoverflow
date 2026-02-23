'use client';

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, use} from "react";

import { toast} from "sonner";
import { formatNumber } from "@/lib/utils";
import { hasVotedResponse } from "@/types/action";
import { createVote } from "@/lib/actions/vote.action";

interface Props {
  targetId: string;
  targetType: "question" | "answer";
  upvotes: number;
  downvotes: number;
  hasVotedPromise: Promise<ActionResponse<hasVotedResponse>>;
}
const Votes = ({ upvotes, downvotes, hasVotedPromise,targetId,targetType}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const userId = session?.data?.user?.id;

  const {success,data} = use(hasVotedPromise)
const {hasUpvoted,hasDownvoted} =data || {}

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId) return toast.error("Only logged-in users can vote.");

    setIsLoading(true);

    try {

      const result = await createVote({
        targetId,
        targetType,
        voteType,
      })

      if(!result.success){
      return toast.error(result.error?.message || "Failed to vote");
      }


      const successMessage =
        voteType === "upvote"
          ? `Upvote ${!hasUpvoted ? "added" : "removed"} successfully`
          : `Downvote ${!hasDownvoted ? "added" : "removed"} successfully`;

      toast.success(`${successMessage}. Your vote has been recorded.`);
    } catch (error) {
      toast.error(
        `${error}  An error occurred while voting. Please try again later. `
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={success &&hasUpvoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Upvote"
          onClick={() => !isLoading && handleVote("upvote")}
        />
        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(upvotes)}{" "}
          </p>
        </div>
      </div>
      <div className="flex-center gap-1.5">
        <Image
          src={success &&hasDownvoted ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
          width={18}
          height={18}
          alt="downvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Downvote"
          onClick={() => !isLoading && handleVote("downvote")}
        />
        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(downvotes)}
          </p>
        </div>
      </div>
    </div>
  );
};
export default Votes;
