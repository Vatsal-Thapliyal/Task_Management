const express = require('express');
const { createTask, updateTask, deleteTask, getTasks } = require('../controllers/taskController');
const { jwtVerificationMiddleware } = require('../middleware/jwtVerification');
const { roleBasedAuthorization } = require('../middleware/roleBasedAuthorization');
const { cacheMiddleware } = require("../middleware/cache");

const router = express.Router();

router.use(jwtVerificationMiddleware);

router.post('/create', roleBasedAuthorization('manager', 'admin'), createTask);
router.put('/update/:id', roleBasedAuthorization('manager', 'admin'), updateTask);
router.delete('/delete/:id', roleBasedAuthorization('manager', 'admin'), deleteTask);
router.get(
  '/getAllTask', 
  cacheMiddleware((req) => {
    const { status = '', priority = '', dueDate = '' } = req.query;
    return `tasks:${req.user._id}:${req.user.role}:status=${status}:priority=${priority}:dueDate=${dueDate}`;
  }),
  getTasks
);


module.exports = router;