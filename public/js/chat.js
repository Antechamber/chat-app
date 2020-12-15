const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// autoscrolling
const autoscroll = () => {
    // get new message element
    const $newMessage = $messages.lastElementChild

    // get height of $newMessage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) // get margin of new message from css file
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin // add margin from css file to new message to get actual size of element

    // get visible height (height visible at one time)
    const visibleHeight = $messages.offsetHeight

    // get height of messages container (height able to be scrolled through)
    const containerHeight = $messages.scrollHeight

    // get how far user is scrolled down (distance scrolled down from top + visible height)
    const scrollOffset = $messages.scrollTop + visibleHeight

    // check if user is scrolled all the way down (minus the new message which was just added)
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

// server event listeners
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (locationMessage) => {
    console.log(locationMessage)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// client side event listeners
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        if (error) {
            console.log(error)
        } else {
            console.log('Message delivered')
        }
    })

    $messageFormInput.value = ''
    $messageFormInput.focus()
    $messageFormButton.removeAttribute('disabled')
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Looks like geolocation is not suppoerted by your web browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            console.log('Location shared')
            $sendLocationButton.removeAttribute('disabled')
        })

    })
})


// pass username and room name to server
socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})