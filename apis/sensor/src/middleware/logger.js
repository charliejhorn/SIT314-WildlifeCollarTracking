const express = require("express")

const logger = function (req, res, next) {
    console.log(req.url)
    next()
}

module.exports = logger