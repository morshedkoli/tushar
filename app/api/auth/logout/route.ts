import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = new URL("/auth", request.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.cookies.set("session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
