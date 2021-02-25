require('./src/db/mongoose')
require('dotenv').config()
const express = require('express');
const CCARouter = require('./src/routers/CCA')
const userRouter = require('./src/routers/user')
const announcementRouter = require('./src/routers/announcement')
const eventRouter = require('./src/routers/event')
const testingRouter = require ('./src/routers/testing')

const app = express()
app.listen(process.env.PORT, ()=> {
  console.log(`started at port ${process.env.PORT}`)
})
app.use(express.json())
app.use(CCARouter)
app.use(userRouter)
app.use(announcementRouter)
app.use(eventRouter)
app.use(testingRouter)