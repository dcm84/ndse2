const express = require('express');
const redis = require('redis')

const REDIS_URL = process.env.REDIS_URL || "redis://localhost";
const client = redis.createClient({url: REDIS_URL});

(async () => {
    await client.connect()
 })();

const app = express();

app.post('/:id/incr', async (req, res) => {
    const { id } = req.params;
    try {
        const cnt = await client.incr(id)
        res.json({id, value: cnt})
    }
    catch(e) {
        res.status(500).json({errcode: 500, error: "Произошла ошибка при обновлении данных о просмотрах книги"});
    }
});

app.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const cnt = await client.get(id);
        res.json({id, value: cnt})
    }
    catch(e) {
        res.status(500).json({errcode: 500, error: "Произошла ошибка при получении о просмотрах книги"});
    }
});

//стартуем сервер
const PORT = process.env.COUNTER_PORT || 3001;

app.listen(PORT, () => {
    console.log(`Счетчик работает на порту ${PORT}`);
});