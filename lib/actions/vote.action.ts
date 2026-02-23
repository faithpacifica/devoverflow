"use server";

import mongoose, { ClientSession } from "mongoose";
import { Answer, Question, Vote } from "@/database";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CreateVoteSchema,
  hasVotedSchema,
  UpdateVoteCountSchema,
} from "../validations";
import {
  CreateVoteParams,
  HasVotedParams,
  hasVotedResponse,
  UpdateVoteCountParams,
} from "@/types/action";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function updateVoteCount(
  params: UpdateVoteCountParams,
  session?: ClientSession //ClientSession param added to ensure atomicity when updating vote counts
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateVoteCountSchema,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { targetId, targetType, voteType, change } = validationResult.params!;
  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";
  try {
    //update the vote count atomically using the session
    const result = await Model.findByIdAndUpdate(
      targetId, //<-questionID or answerID
      { $inc: { [voteField]: change } }, //dinamically change the field to update based on voteType
      { new: true, session } //something goes wrong here, check the session part, it should be passed from the createVote function to ensure atomicity
    );
    if (!result)
      return handleError(
        new Error("Failed to update vote count")
      ) as ErrorResponse;
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(
  params: CreateVoteParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;
  console.log(
    userId,
    targetId,
    targetType,
    voteType,
    "-userzid, targetId,targetType,voteType"
  );
  if (!userId) handleError(new Error("Unauthorized")) as ErrorResponse;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    console.log(
      userId,
      targetId,
      targetType,
      voteType,
      "-userzid, targetId,targetType,voteType"
    );
    console.log(existingVote);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // If the user has already voted with the same voteType, remove the vote
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
        await updateVoteCount(
          { targetId, targetType, voteType, change: -1 },
          session
        );
      } else {
        // If the user has already voted with a different voteType, update the vote
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session }
        );
        await updateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session
        );
      }
    } else {
      // If the user has not voted yet, create a new vote
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        {
          session,
        }
      );
      await updateVoteCount(
        { targetId, targetType, voteType, change: 1 },
        session
      );
    }
    await session.commitTransaction();
    session.endSession();

    // result has happen instantly when user clicks the button, but the real data will be updated after the transaction is commited, so we need to revalidate the path to fetch the real data and update the UI accordingly
    revalidatePath(ROUTES.QUESTION(targetId));

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleError(error) as ErrorResponse;
  }
}

export async function hasVoted(
  params: HasVotedParams
): Promise<ActionResponse<hasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: hasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote) {
      return {
        success: false,
        data: { hasUpvoted: false, hasDownvoted: false },
      };
    }

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
