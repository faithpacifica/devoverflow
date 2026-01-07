//Get by ID // Path:app/api/tickets/[id]

import tickets from "@/app/database";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticket = tickets.find((ticket) => ticket.id === Number(id));
  return NextResponse.json(ticket);
}

// UPDATE by ID

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, status, type } = await request.json();
  const ticket = tickets.find((ticket) => ticket.id === parseInt(id));

  if (!ticket)
    return NextResponse.json(new Error("Ticket not found"), { status: 404 });
  if (name) ticket.name = name;
  if (status) ticket.status = status;
  if (type) ticket.type = type;

  return NextResponse.json(ticket);
}

// DELETE by ID

export async function DELETE(
  _: Request, // request ishlatmaganim uchun _ bn almashtirsa bularkan
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticketIndex = tickets.findIndex((ticket) => ticket.id === parseInt(id));

  if (ticketIndex === -1)
    return NextResponse.json(new Error("Ticket not found"), { status: 404 });

  const deletedTicket = tickets.splice(ticketIndex, 1);

  return NextResponse.json(deletedTicket);
}

