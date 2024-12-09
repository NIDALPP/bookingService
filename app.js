const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(morgan('dev'))
const bookingRoute = require('./routes/bookingRoutes')

require('dotenv').config()
app.use(express.json())

app.use('/booking', bookingRoute)
app.use((err, req, res, next) => {
    res.status(err.status || 500)

    res.send({
        error:{status: err.status || 500,
        message: err.message}
    })
})
const port = process.env.PORT || 3002
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})