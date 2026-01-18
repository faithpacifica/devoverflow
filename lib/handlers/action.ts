/*Har qanday server action oldidan umumiy tekshiruvlarni bajaradi.
bu abstraction / utility.
Ya’ni:
✅ Parametrlarni tekshiradi (validation)
✅ User login qilganmi tekshiradi (authorization)
✅ MongoDB ga ulanadi
✅ Oxirida params va session qaytaradi */
"use server";

import { Session } from "next-auth";
import { ZodError, ZodSchema } from "zod";

import { auth } from "@/auth";

import { UnauthorizedError, ValidationError } from "../http-errors";
import dbConnect from "../mongoose";

type ActionOptions<T> = {
  params?: T; //T defaned type parameter bo'lib, u action funksiyasiga beriladigan params ning turini aniqlaydi
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

// 1. Checking whether the schema and params are provided and validated.
// 2. Checking whether the user is authorized.
// 3. Connecting to the database.
// 4. Returning the params and session.

async function  action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>) {
  if (schema && params) {
    try {
      schema.parse(params); //
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>
        );
      } else {
        return new Error("Schema validation failed");
      }
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();

    if (!session) {
      return new UnauthorizedError();
    }
  }

  await dbConnect();

  return { params, session };
}

export default action;