import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Course from './Course';

class Review extends Model {
  public id!: number;
  public studentId!: number;
  public courseId!: number;
  public rating!: number;
  public comment?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    }
  },
  {
    sequelize,
    tableName: 'reviews',
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'courseId']
      },
      {
        fields: ['courseId']
      },
      {
        fields: ['studentId']
      },
      {
        fields: ['rating']
      }
    ]
  }
);

Review.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Review.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

export default Review;
