import { Op } from 'sequelize';
import Course, { CourseStatus } from '../models/Course';
import Lesson from '../models/Lesson';
import Category from '../models/Category';
import User from '../models/User';
import { logQuery } from '../utils/dbLogger';
import { NotFoundError, AuthorizationError } from '../utils/errors';

export class CourseService {
  async getCourses(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: number;
    instructor?: number;
    status?: CourseStatus;
    level?: string;
  }) {
    const page = parseInt(String(query.page)) || 1;
    const limit = parseInt(String(query.limit)) || 10;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (query.search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } }
      ];
    }

    if (query.category) {
      whereClause.categoryId = parseInt(String(query.category));
    }

    if (query.instructor) {
      whereClause.instructorId = parseInt(String(query.instructor));
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.level) {
      whereClause.level = query.level;
    }

    const startTime = Date.now();
    const { count, rows } = await Course.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    const endTime = Date.now();
    
    logQuery(
      `SELECT courses with filters: ${JSON.stringify(whereClause)}, limit: ${limit}, offset: ${offset}`,
      endTime - startTime,
      'Get Courses Query'
    );

    return {
      courses: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async getCourseById(id: number, includeLessons = false) {
    const includeOptions: any[] = [
      {
        model: User,
        as: 'instructor',
        attributes: ['id', 'firstName', 'lastName', 'email', 'bio']
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
      }
    ];

    const course = await Course.findByPk(id, {
      include: includeOptions
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // If lessons are requested, fetch them separately to avoid association issues
    if (includeLessons) {
      const lessons = await Lesson.findAll({
        where: { courseId: id },
        order: [['order', 'ASC']],
        attributes: ['id', 'title', 'description', 'order', 'type', 'duration']
      });
      (course as any).lessons = lessons;
    }

    return course;
  }

  async createCourse(courseData: any, instructorId: number) {
    const course = await Course.create({
      ...courseData,
      instructorId
    });

    return course;
  }

  async updateCourse(id: number, courseData: any, userId: number, userRole: string) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (userRole !== 'admin' && course.instructorId !== userId) {
      throw new AuthorizationError('You can only update your own courses');
    }

    await course.update(courseData);
    return course;
  }

  async deleteCourse(id: number, userId: number, userRole: string) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (userRole !== 'admin' && course.instructorId !== userId) {
      throw new AuthorizationError('You can only delete your own courses');
    }

    await course.destroy();
  }

  async getCourseLessons(courseId: number) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    });

    return lessons;
  }

  async addLesson(courseId: number, lessonData: any, instructorId: number) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new AuthorizationError('You can only add lessons to your own courses');
    }

    const lesson = await Lesson.create({
      ...lessonData,
      courseId
    });

    return lesson;
  }

  async updateLesson(courseId: number, lessonId: number, lessonData: any, instructorId: number) {
    const lesson = await Lesson.findOne({
      where: { id: lessonId, courseId }
    });

    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    const course = await Course.findByPk(courseId);
    if (course!.instructorId !== instructorId) {
      throw new AuthorizationError('You can only update lessons in your own courses');
    }

    await lesson.update(lessonData);
    return lesson;
  }

  async deleteLesson(courseId: number, lessonId: number, instructorId: number) {
    const lesson = await Lesson.findOne({
      where: { id: lessonId, courseId }
    });

    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    const course = await Course.findByPk(courseId);
    if (course!.instructorId !== instructorId) {
      throw new AuthorizationError('You can only delete lessons from your own courses');
    }

    await lesson.destroy();
  }
}

export default new CourseService();
