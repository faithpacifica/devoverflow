//if i want smth to search in all tickets
// params(/products/123)  and searchParams(?category=shoes)->  ? dan keyingi qism

import tickets from "@/app/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  //searchParams is a URLSearchParams object
  //api/tickets/search?query=hello
  // {query: 'hello'}
  const query = searchParams.get("query") ;

  if (!query) {
    return NextResponse.json(tickets);
  }

  const filteredTickets = tickets.filter((ticket) =>
    ticket.name.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json(filteredTickets);
}
