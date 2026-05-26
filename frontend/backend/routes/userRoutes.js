const express = require('express')
const { authorize, protect } = require('../middleware/authMiddleware')
const { createUser, deleteUser, getUser, getUsers, updateUser } = require('../controllers/userController')

const router = express.Router()

router.use(protect, authorize('Admin', 'account team'))

router.route('/').get(getUsers).post(createUser)
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router
