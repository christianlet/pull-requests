import server from '@christianlet/pull-requests-api'

const PORT = 3000

server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})