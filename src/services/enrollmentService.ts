import Enrollment, { EnrollmentStatus } from '../models/Enrollment';
import Course from '../models/Course';
import User from '../models/User';
import { NotFoundError, ConflictError } from '../utils/errors';

export class EnrollmentService {
  async enrollStudent(studentId: number, courseId: number) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.status !== 'published') {
      throw new ConflictError('Course is not available for enrollment');
    }

    const existingEnrollment = await Enrollment.findOne({
      where: { studentId, courseId }
    });

    if (existingEnrollment) {
      throw new ConflictError('Already enrolled in this course');
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: EnrollmentStatus.ACTIVE
    });

    return enrollment;
  }

  async getMyCourses(studentId: number) {
    const enrollments = await Enrollment.findAll({
      where: { studentId },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['enrolledAt', 'DESC']]
    });

    return enrollments;
  }

  async unenrollStudent(studentId: number, courseId: number) {
    const enrollment = await Enrollment.findOne({
      where: { studentId, courseId }
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    await enrollment.destroy();
  }

  async getCourseStudents(courseId: number, instructorId: number) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Allow admin access or instructor access to their own courses
    const user = await User.findByPk(instructorId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'admin' && course.instructorId !== instructorId) {
      throw new NotFoundError('Course not found');
    }

    const enrollments = await Enrollment.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['enrolledAt', 'DESC']]
    });

    return enrollments;
  }

  async getEnrollmentAnalytics(instructorId: number) {
    const courses = await Course.findAll({
      where: { instructorId }
    });

    const analytics = await Promise.all(courses.map(async (course) => {
      const enrollments = await Enrollment.findAll({
        where: { courseId: course.id },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter(e => e.status === 'active').length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
        students: enrollments.map((e: any) => ({
          id: e.student.id,
          name: `${e.student.firstName} ${e.student.lastName}`,
          status: e.status,
          enrolledAt: e.enrolledAt
        }))
      };
    }));

    return analytics;
  }
}

export default new EnrollmentService();
