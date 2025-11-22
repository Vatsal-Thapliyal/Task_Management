const express = require("express");
const router = express.Router();

const { jwtVerificationMiddleware } = require("../middleware/jwtVerification");
const { getUserProfile, getAllProfiles } = require("../controllers/userController");
const { cacheMiddleware } = require("../middleware/cache");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management with role-based access control
 */

/**
 * @swagger
 * /psiborg/user/getUserProfile:
 *   get:
 *     summary: Get current user's profile
 *     description: Retrieve the authenticated user's profile information (excludes password). Uses Redis caching.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     role:
 *                       type: string
 *                       enum: [user, manager, admin]
 *                       example: user
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/getUserProfile",
  jwtVerificationMiddleware,
  cacheMiddleware((req) => `user:profile:${req.user._id}`),
  getUserProfile
);

/**
 * @swagger
 * /psiborg/user/getAllProfiles:
 *   get:
 *     summary: Get user profiles based on role
 *     description: |
 *       Retrieve user profiles based on the authenticated user's role:
 *       - **Admin**: Can see all users
 *       - **Manager**: Can see users assigned to their created tasks
 *       - **User**: Can only see their own profile
 *       Uses Redis caching with role-based cache keys.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profiles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profiles fetched successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *                       role:
 *                         type: string
 *                         enum: [user, manager, admin]
 *                         example: user
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/getAllProfiles",
  jwtVerificationMiddleware,
  cacheMiddleware((req) => `user:profiles:${req.user._id}:${req.user.role}`),
  getAllProfiles
);

module.exports = router;
