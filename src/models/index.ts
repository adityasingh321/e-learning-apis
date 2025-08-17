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
Course.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

// Course associations
Course.belongsTo(User, { as: 'instructor', foreignKey: 'instructorId' });
Course.hasMany(Lesson, { as: 'lessons', foreignKey: 'courseId' });
Course.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'courseId' });
Course.hasMany(Progress, { as: 'progress', foreignKey: 'courseId' });
Course.hasMany(Review, { as: 'reviews', foreignKey: 'courseId' });

// Lesson associations
Lesson.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Lesson.hasMany(Progress, { as: 'progress', foreignKey: 'lessonId' });

// Enrollment associations
Enrollment.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Enrollment.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

// Progress associations
Progress.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Progress.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Progress.belongsTo(Lesson, { as: 'lesson', foreignKey: 'lessonId' });

// Review associations
Review.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Review.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

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