import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Course from './Course';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment'
}

class Lesson extends Model {
  public id!: number;
  public title!: string;
  public description?: string;
  public content!: string;
  public courseId!: number;
  public order!: number;
  public type!: LessonType;
  public duration?: number;
  public videoUrl?: string;
  public attachments?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM(...Object.values(LessonType)),
      allowNull: false,
      defaultValue: LessonType.TEXT
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes'
    },
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string of attachment URLs'
    }
  },
  {
    sequelize,
    tableName: 'lessons',
    indexes: [
      {
        fields: ['courseId']
      },
      {
        fields: ['courseId', 'order']
      }
    ]
  }
);

Lesson.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

export default Lesson;
