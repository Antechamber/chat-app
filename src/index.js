const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
    // const Filter = require('bad-words')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
    res.render('index.html')
})


// event handlers for client side events
io.on('connection', (socket) => {
    console.log('New socket connection')

    socket.on('join', ({ username, room }, callback) => {
        // create user and check for error
        const { error, user } = addUser({
                id: socket.id,
                username,
                room
            })
            // if addUser returns error, pass to client through callback on 'join' event
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage("(っ・>・)っ♨", 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('ʕ •ᴥ•ʔ', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        // let client know everything worked
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        // const filter = new Filter()
        // if (filter.isProfane(message)) {
        //     return callback('Watch your mouth!')
        // }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, aknowledge) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords))
        aknowledge()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
            // if user returned by removeUser, then let other users know it has been removed
        if (user) {
            io.to(user.room).emit('message', generateMessage('༼ ༎ຶ ෴ ༎ຶ༽', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})


server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})