const mongoose = require('mongoose')
const Document = require('./Document')

// mongoose.connect(process.env.MONGODB_CONNECT_URI)
mongoose.connect('mongodb+srv://ms0909:yODkdmPtQsvW2ZGn@cluster0.k7nhhbh.mongodb.net/?retryWrites=true&w=majority')


const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

const defaultValue = ""

io.on("connection", socket => {
    socket.on('get-document', async documentId => {
        try {
            const document = await findOrCreateDocument(documentId)
            socket.join(documentId)
            socket.emit('load-document', document.data)
    
            socket.on('send-changes', delta => {
                socket.broadcast.to(documentId).emit('receive-changes', delta)
            })
    
            socket.on('save-document', async data => {
                await Document.findByIdAndUpdate(documentId, { data })
            })
            
        } catch (error) {
            console.error(error)
        }
    })
})

async function findOrCreateDocument(id) {
    try {
        if(id == null) return
        const document = await Document.findById(id)
        if (document) return document
    
        return await Document.create({ _id: id, data: defaultValue })
    } catch (error) {
        console.error(error)
    }
}