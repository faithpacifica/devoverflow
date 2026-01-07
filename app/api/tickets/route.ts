import tickets from "@/app/database";
import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json(tickets);
};

export const POST = async (request: Request) => {
  const ticket = await request.json();
  tickets.push({ id: tickets.length + 1, ...ticket });
  return NextResponse.json(ticket);
};


