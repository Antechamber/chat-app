const users = []

// C.R.U.D. user functions
const addUser = ({ id, username, room }) => {
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate
    if (!room || !username) {
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing users with same username
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    if (existingUser) {
        return {
            error: 'Username already taken in that room'
        }
    }

    //store
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    // search for matching user's index in users array
    const userIndex = users.findIndex((user) => id === user.id)
        // findIndex returns -1 if no match is found
    if (userIndex !== -1) {
        return users.splice(userIndex, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}