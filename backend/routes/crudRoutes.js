const express = require('express')

function crudRoutes(controller) {
  const router = express.Router()

  router.route('/').get(controller.getAll).post(controller.create)
  router.route('/:id').get(controller.getById).put(controller.update).delete(controller.remove)

  return router
}

module.exports = crudRoutes
