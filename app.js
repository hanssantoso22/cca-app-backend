require('./src/db/mongoose')
const express = require('express');
const CCARouter = require('./src/routers/CCA')
const userRouter = require('./src/routers/user')
const { PORT } = require('./config')

const app = express()
app.listen(PORT, ()=> {
  console.log("started!")
})
app.use(express.json())
app.use(CCARouter)
app.use(userRouter)

