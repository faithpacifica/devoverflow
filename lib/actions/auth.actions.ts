"use server";

import { signIn } from "@/auth";
import bcrypt from "bcryptjs"; 
import mongoose from "mongoose";

import action from "../handlers/action";
import { SignInSchema, SignUpSchema } from "../validations";
import handleError from "../handlers/error";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import { NotFoundError } from "../http-errors";

export async function signUpWithCredentials(
  params:AuthCredentials
):Promise<ActionResponse>{

  const validationResult = await action({params,schema:SignUpSchema})
  
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { name, username, email, password } = validationResult.params!;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const existingUsername = await User.findOne({ username }).session(session);

    if (existingUsername) {
      throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12); // 12 bu yerda bcrypt kutubxonasi yordamida parolni hash qilish jarayoni amalga oshiriladi, 12 bu yerda "salt rounds" soni bo'lib, u hash jarayonining murakkabligini belgilaydi

    const [newUser] = await User.create([{ username, name, email }], {
      session,
    });

    await Account.create(
      [
        {
          userId: newUser._id,
          name,
          provider: "credentials",
          providerAccountId: email,
          password: hashedPassword,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    await session.abortTransaction();

    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password"> //Pick yordamida faqat email va password maydonlari olinadi
): Promise<ActionResponse> { //ActionResponse turi qaytariladi
  const validationResult = await action({ params, schema: SignInSchema });
//action funksiyasi yordamida params va SignInSchema bilan validatsiya qilinadi
  if (validationResult instanceof Error) { 
    return handleError(validationResult) as ErrorResponse;
  }

  const { email, password } = validationResult.params!;
//Validatsiyadan o'tgan email va password olinadi
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) throw new NotFoundError("User");

    const existingAccount = await Account.findOne({
      provider: "credentials", //
      providerAccountId: email,
    });

    if (!existingAccount) throw new NotFoundError("Account");

    const passwordMatch = await bcrypt.compare(
      password,
      existingAccount.password
    );

    if (!passwordMatch) throw new Error("Password does not match");

    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}