import Category from '../models/Category';
import User, { UserRole } from '../models/User';
import Course, { CourseStatus } from '../models/Course';
import logger from './logger';

export const seedDatabase = async () => {
  try {
    // Check if categories already exist
    const existingCategories = await Category.count();
    if (existingCategories === 0) {
      const categories = await Category.bulkCreate([
        { name: 'Programming', description: 'Programming and software development courses' },
        { name: 'Design', description: 'Graphic design and UI/UX courses' },
        { name: 'Business', description: 'Business and entrepreneurship courses' },
        { name: 'Marketing', description: 'Digital marketing and SEO courses' },
        { name: 'Data Science', description: 'Data analysis and machine learning courses' }
      ]);
      logger.info('Categories seeded successfully');
    } else {
      logger.info('Categories already exist, skipping seeding');
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@elearning.com' } });
    let adminUser;
    if (!existingAdmin) {
      adminUser = await User.create({
        email: 'admin@elearning.com',
        password: 'AdminPass123',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN
      });
      logger.info(`Admin user created: ${adminUser.email}`);
    } else {
      adminUser = existingAdmin;
      logger.info('Admin user already exists');
    }

    // Check if instructor user already exists
    const existingInstructor = await User.findOne({ where: { email: 'instructor@elearning.com' } });
    let instructorUser;
    if (!existingInstructor) {
      instructorUser = await User.create({
        email: 'instructor@elearning.com',
        password: 'InstructorPass123',
        firstName: 'John',
        lastName: 'Instructor',
        role: UserRole.INSTRUCTOR
      });
      logger.info(`Instructor user created: ${instructorUser.email}`);
    } else {
      instructorUser = existingInstructor;
      logger.info('Instructor user already exists');
    }

    // Check if sample course already exists
    const existingCourse = await Course.findOne({ where: { title: 'Introduction to Web Development' } });
    if (!existingCourse) {
      const categories = await Category.findAll();
      if (categories.length > 0) {
        const sampleCourse = await Course.create({
          title: 'Introduction to Web Development',
          description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This comprehensive course covers everything you need to know to start building websites.',
          price: 49.99,
          instructorId: instructorUser.id,
          categoryId: categories[0].id,
          status: CourseStatus.PUBLISHED,
          level: 'beginner',
          language: 'English',
          duration: 480
        });
        logger.info(`Sample course created: ${sampleCourse.title}`);
      }
    } else {
      logger.info('Sample course already exists');
    }

    logger.info('Sample data seeding completed');

  } catch (error) {
    logger.error('Error seeding database:', error);
  }
};
