const express = require('express');
const { createTask, updateTask, deleteTask, getTasks } = require('../controllers/taskController');
const { jwtVerificationMiddleware } = require('../middleware/jwtVerification');
const { roleBasedAuthorization } = require('../middleware/roleBasedAuthorization');
const { cacheMiddleware } = require("../middleware/cache");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management with role-based permissions (Manager/Admin can create/modify, all roles can view based on assignment)
 */

/**
 * @swagger
 * /psiborg/task/create:
 *   post:
 *     summary: Create a new task
 *     description: Only Manager/Admin roles can create tasks. Tasks cannot be assigned to Admin users.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - assignedTo
 *             properties:
 *               title:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [pending, complete]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/create', jwtVerificationMiddleware, roleBasedAuthorization('manager', 'admin'), createTask);

/**
 * @swagger
 * /psiborg/task/update/{id}:
 *   put:
 *     summary: Update an existing task
 *     description: Only Manager/Admin can update tasks. Cannot assign tasks to Admin users.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [pending, complete]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/update/:id', jwtVerificationMiddleware, roleBasedAuthorization('manager', 'admin'), updateTask);

/**
 * @swagger
 * /psiborg/task/delete/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Only Manager/Admin can delete tasks.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/delete/:id', jwtVerificationMiddleware, roleBasedAuthorization('manager', 'admin'), deleteTask);

/**
 * @swagger
 * /psiborg/task/getAllTask:
 *   get:
 *     summary: Get all tasks based on role
 *     description: |
 *       - Admin: Can see all tasks
 *       - Manager: Can see tasks they created
 *       - User: Can only see tasks assigned to them
 *       Optional filters: status, priority. Uses Redis caching.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, complete]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/getAllTask', 
  jwtVerificationMiddleware,
  cacheMiddleware((req) => {
    const { status = '', priority = '' } = req.query;
    return `tasks:${req.user._id}:${req.user.role}:status=${status}:priority=${priority}`;
  }),
  getTasks
);

module.exports = router;
