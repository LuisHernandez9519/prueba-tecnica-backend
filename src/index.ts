import app from './app'

app.listen(process.env.PORT, () => {
    console.log(`Express is listening at http://localhost:${process.env.PORT}`);
});