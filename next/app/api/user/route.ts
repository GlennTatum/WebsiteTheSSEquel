import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * HTTP GET request to /api/user/
 * @returns list of user objects
 */
export async function GET() {
  const allDepts = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });
  return Response.json(allDepts);
}

/**
 * Create a new user
 * HTTP POST request to /api/user/
 * @param request { firstName: string, lastName: string }
 * @return user object that was created
 */
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 422 });
  }

  // make sure the title and shortTitle properties are included
  if (!("firstName" in body && "lastName" in body && "email" in body)) {
    return new Response(
      '"firstName", "lastName", and "email" must be included in request body',
      { status: 422 }
    );
  }
  const firstName = body.firstName;
  const lastName = body.lastName;
  const email = body.email;

  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
      },
    });
    return Response.json(user, { status: 201 });
  } catch (e) {
    return new Response(`Failed to create user: ${e}`, { status: 500 });
  }
}

/**
 * HTTP DELETE request to /api/user
 * @param request { id: number }
 * @returns user object previously at { id }
 */
export async function DELETE(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 422 });
  }

  // verify the id is included
  if (!("id" in body)) {
    return new Response("ID must be included", { status: 422 });
  }
  const id = body.id;

  // make sure the specified department exists
  try {
    const user = await prisma.user.delete({ where: { id } });
    return Response.json(user);
  } catch {
    return new Response(`Couldn't find user ID ${id}`, { status: 404 });
  }
}

/**
 * Update an existing user
 * HTTP PUT request to /api/user
 * @param request { id: number, firstName?: string, lastName?: string, email?: string }
 * @returns updated user object
 */
export async function PUT(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 422 });
  }

  // verify that the id is included in the request
  if (!("id" in body)) {
    return new Response("ID must be included", { status: 422 });
  }
  const id = body.id;

  // only update included fields
  const data: { firstName?: string; lastName?: string; email?: string } = {};
  if ("firstName" in body) {
    data.firstName = body.firstName;
  }
  if ("lastName" in body) {
    data.lastName = body.lastName;
  }
  if ("email" in body) {
    data.email = body.email;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return Response.json(user);
  } catch (e) {
    // make sure the selected user exists
    return new Response(`Failed to update user: ${e}`, { status: 500 });
  }
}
