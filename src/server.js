import express from "express";
import { MongoClient } from "mongodb";
import path from "path";

const app = express();

app.use(express.json());//must be above

app.use(express.static(path.join(__dirname,'/build')))

const withDb= async (operations, res)=>{
    try {

        const client = await MongoClient.connect('mongodb+srv://shickenphoot:4Testing!@dhdb.6ycem.mongodb.net/my-blog?retryWrites=true&w=majority', { useNewUrlParser: true })
        const db = client.db('my-blog');

        await operations(db);

        client.close()
    } catch (er) {
        res.status(500).json({ message: 'Error connecting to db', error })
    }
}

app.get('/api/articles/:name', async (req, res) => {
        withDb(async (db)=>{
            const articleName = req.params.name;

            const articleInfo = await db.collection('articles').findOne({ name: articleName })
            res.status(200).json(articleInfo);
        },res)

})

app.post('/api/articles/:name/upvote', async (req, res) => {

    withDb(async (db)=>{
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName })
        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                upvotes: articleInfo.upvotes + 1,
            },
        })
        const updateArticleInfo = await db.collection('articles').findOne({ name: articleName })

        res.status(200).json(updateArticleInfo)
    },res)

})
app.post('/api/articles/:name/add-comment', async (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;

    withDb(async (db)=>{
        const articleInfo = await db.collection('articles').findOne({ name: articleName })
        await db.collection('articles').updateOne({ name: articleName }, {
            '$set':{
                comments: articleInfo.comments.concat({username, text}),
            },
        });
        const updateArticleInfo = await db.collection('articles').findOne({name: articleName})

        res.status(200).json(updateArticleInfo)
    },res)
})

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname+'/build/index.html'));
})
app.listen(8000, () => console.log('Listening on port 8000'))

