import { prisma } from './index';
import { Course } from '@prisma/client';

// Create a Course
async function createCourse(courseDetails: Course) {
  const { name, cohortId } = courseDetails;

  const course = await prisma.course.create({
    data: {
      name,
      cohortId,
    },
  });

  return course;
}

// Delete a Course
export async function deleteCourse(id: number) {
  const course = await prisma.course.delete({
    where: { id },
  });

  return course;
}

// Get All Courses
export async function retrieveAllCourses() {
  const courses = await prisma.course.findMany();
  return courses;
}

// Get All Courses from a Specific Cohort
export async function retrieveAllCoursesFromCohort(cohortId: number) {
  const courses = await prisma.course.findMany({
    where: { cohortId },
  });

  return courses;
}

// Get a Specific Course
export async function retrieveSpecificCourse(id: number) {
  const course = await prisma.course.findUnique({
    where: { id },
  });

  return course;
}

// Update a Course
export async function updateCourse(id: number, courseDetails: Course) {
  const updateCourse = await prisma.course.update({
    where: { id },
    data: {
      ...courseDetails,
    },
  });

  return updateCourse;
}

const courseActions = {
  createCourse,
  deleteCourse,
  retrieveAllCourses,
  retrieveAllCoursesFromCohort,
  retrieveSpecificCourse,
  updateCourse,
};

export default courseActions;
