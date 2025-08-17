import Progress from '../models/Progress';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import Enrollment, { EnrollmentStatus } from '../models/Enrollment';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import User from '../models/User';

export class ProgressService {
  async updateProgress(studentId: number, courseId: number, lessonId: number, progressData: {
    isCompleted: boolean;
    timeSpent?: number;
    score?: number;
  }) {
    const enrollment = await Enrollment.findOne({
      where: { studentId, courseId }
    });

    if (!enrollment) {
      throw new AuthorizationError('You must be enrolled to track progress');
    }

    const lesson = await Lesson.findOne({
      where: { id: lessonId, courseId }
    });

    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    const [progress, created] = await Progress.findOrCreate({
      where: { studentId, courseId, lessonId },
      defaults: {
        ...progressData,
        completedAt: progressData.isCompleted ? new Date() : null
      }
    });

    if (!created) {
      await progress.update({
        ...progressData,
        completedAt: progressData.isCompleted ? new Date() : null
      });
    }

    return progress;
  }

  async getCourseProgress(studentId: number, courseId: number) {
    const enrollment = await Enrollment.findOne({
      where: { studentId, courseId }
    });

    if (!enrollment) {
      throw new AuthorizationError('You must be enrolled to view progress');
    }

    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['id', 'title', 'order', 'type', 'duration']
        }
      ]
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const progress = await Progress.findAll({
      where: { studentId, courseId },
      include: [
        {
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'title', 'order']
        }
      ]
    });

    const courseWithLessons = course as any;
    const totalLessons = courseWithLessons.lessons.length;
    const completedLessons = progress.filter(p => p.isCompleted).length;
    const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    const lessonProgress = courseWithLessons.lessons.map((lesson: any) => {
      const lessonProgress = progress.find(p => p.lessonId === lesson.id);
      return {
        lessonId: lesson.id,
        title: lesson.title,
        order: lesson.order,
        type: lesson.type,
        duration: lesson.duration,
        isCompleted: lessonProgress?.isCompleted || false,
        timeSpent: lessonProgress?.timeSpent || 0,
        score: lessonProgress?.score || null,
        completedAt: lessonProgress?.completedAt || null
      };
    });

    return {
      courseId,
      courseTitle: course.title,
      totalLessons,
      completedLessons,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      lessonProgress
    };
  }

  async getStudentProgressForInstructor(courseId: number, instructorId: number) {
    const course = await Course.findByPk(courseId);
    if (!course || course.instructorId !== instructorId) {
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
      ]
    });

    const totalLessons = await Lesson.count({ where: { courseId } });

    const studentProgress = await Promise.all(enrollments.map(async (enrollment: any) => {
      // Get progress for this specific student and course
      const progress = await Progress.findAll({
        where: { 
          studentId: enrollment.studentId, 
          courseId 
        },
        include: [
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title', 'order']
          }
        ]
      });

      const completedLessons = progress.filter((p: any) => p.isCompleted).length;
      const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      return {
        studentId: enrollment.studentId,
        studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        studentEmail: enrollment.student.email,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        completedLessons,
        totalLessons,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        lastActivity: progress.length > 0 
          ? new Date(Math.max(...progress.map((p: any) => p.updatedAt.getTime()))).toISOString()
          : enrollment.enrolledAt.toISOString()
      };
    }));

    return studentProgress;
  }
}

export default new ProgressService();
