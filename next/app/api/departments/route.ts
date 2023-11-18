import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * HTTP GET request to /api/departments/
 * @returns list of department objects
 */
export async function GET() {
  const allDepts = await prisma.department.findMany({
    select: {
      id: true,
      title: true,
      shortTitle: true,
      course: {
        select: {
          title: true,
          code: true,
        },
      },
    },
  });
  return Response.json(allDepts);
}

/**
 * HTTP POST request to /api/departments/
 * @param request { title: string, shortTitle: string }
 * @return department object that was created
 */
export async function POST(request: Request) {
  const body = await request.json();

  // make sure the title and shortTitle properties are included
  if (!("title" in body && "shortTitle" in body)) {
    return new Response(
      'Both "title" and "shortTitle" must be included in request body',
      { status: 400 }
    );
  }
  const title = body.title;
  const shortTitle = body.shortTitle;

  const dept = await prisma.department.create({
    data: {
      title,
      shortTitle,
    },
  });
  return Response.json(dept, { status: 201 });
}

/**
 * HTTP DELETE request to /api/departments
 * @param request { id: number }
 * @returns department object previously at { id }
 */
export async function DELETE(request: Request) {
  const body = await request.json();

  // verify the id is included
  if (!("id" in body)) {
    return new Response("ID must be included", { status: 400 });
  }
  const id = body.id;

  // in order to delete a department you need to delete all the courses in it
  const courses = await prisma.course.findMany({
    where: { departmentId: id },
  });
  for (let course of courses) {
    // in order to delete a course you need to delete every time someone's taken the course
    const courseId = course.id;
    await prisma.courseTaken.deleteMany({ where: { courseId } });
  }

  await prisma.course.deleteMany({
    where: { departmentId: id },
  });

  // make sure the specified department exists
  try {
    const department = await prisma.department.delete({ where: { id } });
    return Response.json({ department, courses });
  } catch {
    return new Response(`Couldn't find department ID ${id}`, { status: 404 });
  }
}

/**
 * HTTP PUT request to /api/departments
 * @param request { id: number, title?: string, shortTitle?: string }
 * @returns updated department object
 */
export async function PUT(request: Request) {
  const body = await request.json();

  // verify that the id is included in the request
  if (!("id" in body)) {
    return new Response("ID must be included", { status: 400 });
  }
  const id = body.id;

  // only update included fields
  const data: { title?: string; shortTitle?: string } = {};
  if ("title" in body) {
    data.title = body.title;
  }
  if ("shortTitle" in body) {
    data.shortTitle = body.shortTitle;
  }

  const dept = await prisma.department.update({
    where: { id },
    data,
  });
  // make sure the selected department exists
  if (dept == null) {
    return new Response(`Couldn't find department ID ${id}`, { status: 404 });
  }
  return Response.json(dept);
}
