import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Course from './Course';
import Lesson from './Lesson';

class Progress extends Model {
  public id!: number;
  public studentId!: number;
  public courseId!: number;
  public lessonId!: number;
  public isCompleted!: boolean;
  public completedAt?: Date;
  public timeSpent?: number;
  public score?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Progress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lessons',
        key: 'id'
      }
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time spent in seconds'
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    }
  },
  {
    sequelize,
    tableName: 'progress',
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'courseId', 'lessonId']
      },
      {
        fields: ['studentId']
      },
      {
        fields: ['courseId']
      },
      {
        fields: ['lessonId']
      },
      {
        fields: ['isCompleted']
      }
    ]
  }
);

export default Progress;
