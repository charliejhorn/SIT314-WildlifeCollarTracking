import express from 'express'

const router = express.Router()

router.post("/", (req, res) => {
    console.log(req.body)

    res.status(201)
    res.send()
})

export default router;