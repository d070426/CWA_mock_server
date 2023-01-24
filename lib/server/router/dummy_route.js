'use strict'

const express = require('express')

module.exports = () => {
    const router = express.Router()
  
    router.get('/dummy_route', function (req, res, next) {
        console.log("Dummy Router Working");
        res.end();
    })
  
    return router
}