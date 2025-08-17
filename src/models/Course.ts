import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Category from './Category';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

class Course extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public price!: number;
  public instructorId!: number;
  public categoryId!: number;
  public status!: CourseStatus;
  public thumbnail?: string;
  public duration?: number;
  public level?: string;
  public language?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Course.init(
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
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CourseStatus)),
      allowNull: false,
      defaultValue: CourseStatus.DRAFT
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes'
    },
    level: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['beginner', 'intermediate', 'advanced']]
      }
    },
    language: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'English'
    }
  },
  {
    sequelize,
    tableName: 'courses',
    indexes: [
      {
        fields: ['instructorId']
      },
      {
        fields: ['categoryId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['title']
      }
    ]
  }
);


export default Course;
