import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Category extends Model {
  public id!: number;
  public name!: string;
  public description?: string;
  public image?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'categories'
  }
);

export default Category;
