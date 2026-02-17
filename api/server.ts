import app from './src/index'


const PORT = 3000

// Start server
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})