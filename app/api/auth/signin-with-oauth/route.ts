import mongoose from "mongoose";
import slugify from "slugify";
import dbConnect from "@/lib/mongoose";
import handleError from "@/lib/handlers/error";
import { NextResponse } from "next/server";
import { SignInWithOAuthSchema } from "@/lib/validations";
import { ValidationError } from "@/lib/http-errors";
import User from "@/database/user.model";
import Account from "@/database/account.model";

// ADD USERS ACCOUNT TO THE DATABASE 
export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction(); //mongoose session to start a transaction

  try {

    //VALIDATE THE INCOMING DATA
    const validatedData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const { name, username, email, image } = user;


    //GENERATE A NEW USER 
    const slugifiedUsername = slugify(username, {
      //slugify is a function to convert username to a URL-friendly format
      lower: true, // convert to lowercase
      strict: true, // remove special characters
      trim: true, // remove leading/trailing spaces
    });


    //trying to find existing user
    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create(
        [{ name, username: slugifiedUsername, email, image }],
        { session } //is this a part of mongoose session?
      );
    } else {
      const updatedData: { name?: string; image?: string } = {};

      if (existingUser.name !== name) updatedData.name = name; //update name if different
      if (existingUser.image !== image) updatedData.image = image;

      if (Object.keys(updatedData).length > 0) { //update only if there are changes
        await User.updateOne(
          { _id: existingUser._id },//filter to find the user
          { $set: updatedData } // set the updated fields
        ).session(session); // attach to the current session
      }
    }

    //CHECK IF THE ACCOUNT ALREADY EXISTS
    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction(); //commit the transaction if all operations are successful

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await session.abortTransaction();
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    session.endSession();
  }
}


//atomic function is used to ensure that either all operations in a transaction are completed successfully or none are applied, maintaining database integrity.