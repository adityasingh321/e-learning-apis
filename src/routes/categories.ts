import { Router } from 'express';
import Category from '../models/Category';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 */
router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.findAll({
    order: [['name', 'ASC']]
  });

  res.json({
    success: true,
    data: categories
  });
}));

export default router;
