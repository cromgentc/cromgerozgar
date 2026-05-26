const express = require('express')
const { authorize, optionalProtect, protect } = require('../middleware/authMiddleware')

const ADMIN_ROLES = ['Admin', 'staff', 'hiring', 'account team']

function requireAdminWrite(req, res, next) {
  return protect(req, res, (error) => {
    if (error) return next(error)
    return authorize(...ADMIN_ROLES)(req, res, next)
  })
}

function requireAdminRead(req, res, next) {
  return protect(req, res, (error) => {
    if (error) return next(error)
    return authorize(...ADMIN_ROLES)(req, res, next)
  })
}

function requireRoles(roles) {
  return (req, res, next) => {
    return protect(req, res, (error) => {
      if (error) return next(error)
      return authorize(...roles)(req, res, next)
    })
  }
}

function crudRoutes(controller) {
  const router = express.Router()

  router.route('/').get(controller.getAll).post(controller.create)
  router.route('/:id').get(controller.getById).put(controller.update).delete(controller.remove)

  return router
}

crudRoutes.protected = function protectedCrudRoutes(controller, options = {}) {
  const router = express.Router()
  const read = options.publicRead ? optionalProtect : (options.readRoles ? requireRoles(options.readRoles) : requireAdminRead)
  const create = options.publicCreate ? optionalProtect : (options.createRoles ? requireRoles(options.createRoles) : requireAdminWrite)
  const update = options.updateRoles ? requireRoles(options.updateRoles) : requireAdminWrite

  router.route('/').get(read, controller.getAll).post(create, controller.create)
  router.route('/:id').get(read, controller.getById).put(update, controller.update).delete(requireAdminWrite, controller.remove)

  return router
}

module.exports = crudRoutes
