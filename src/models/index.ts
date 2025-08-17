import User, { UserRole, UserStatus } from './User';
import Category from './Category';
import Course, { CourseStatus } from './Course';
import Lesson, { LessonType } from './Lesson';
import Enrollment, { EnrollmentStatus } from './Enrollment';
import Progress from './Progress';
import Review from './Review';

// User associations
User.hasMany(Course, { as: 'courses', foreignKey: 'instructorId' });
User.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'studentId' });
User.hasMany(Progress, { as: 'progress', foreignKey: 'studentId' });
User.hasMany(Review, { as: 'reviews', foreignKey: 'studentId' });

// Category associations
Category.hasMany(Course, { as: 'courses', foreignKey: 'categoryId' });

// Course associations
Course.hasMany(Lesson, { as: 'lessons', foreignKey: 'courseId' });
Course.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'courseId' });
Course.hasMany(Progress, { as: 'progress', foreignKey: 'courseId' });
Course.hasMany(Review, { as: 'reviews', foreignKey: 'courseId' });

// Lesson associations
Lesson.hasMany(Progress, { as: 'progress', foreignKey: 'lessonId' });

export {
  User,
  UserRole,
  UserStatus,
  Category,
  Course,
  CourseStatus,
  Lesson,
  LessonType,
  Enrollment,
  EnrollmentStatus,
  Progress,
  Review
};
