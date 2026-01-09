import { NextResponse } from "next/server";

import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validations";

export async function POST(request: Request) { //request used to get data from client
  const { providerAccountId } = await request.json(); //destructuring to get providerAccountId from request body

  try {
    await dbConnect();//connect to database

    const validatedData = AccountSchema.partial().safeParse({ //partial validation of providerAccountId,safeParse to avoid throwing error
      providerAccountId,
    });

    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);//throw validation error if validation fails

    const account = await Account.findOne({ providerAccountId });// findeOne is used to find a single account by providerAccountId
    if (!account) throw new NotFoundError("Account");

    return NextResponse.json( //returning response to client
      {
        success: true,
        data: account,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}