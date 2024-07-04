const express = require('express');
const amqp = require('amqplib');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require('redis');
const { generateKeyPair } = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// 创建锁座连接
const connect = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        // 声明一个名为 'lock-seat' 的队列
        await channel.assertQueue('lock-seat', { durable: false });

        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
    }
};

// 发送消息
const sendLockSeatMessage = async (orderId, seats) => {
    try {
        const channel = await connect();

        // 发送消息到 'lock-seat' 队列
        await channel.sendToQueue('lock-seat', Buffer.from(JSON.stringify({ orderId, seats })));

        console.log('Lock seat message sent');
    } catch (error) {
        console.error('Failed to send lock seat message:', error);
    }
};

const poolRead = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '20030225',
    database: 'CTSDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const poolWrite = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '20030225',
    database: 'CTSDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

let redisClient;

(async () => {
    try {
        redisClient = redis.createClient();
        redisClient.on('error', (err) => console.error('Redis Client Error', err));

        await redisClient.connect();
        console.log('Redis client connected');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

process.on('exit', () => {
    redisClient.quit();
});

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

// 查找影院
app.get('/api/cinema', async (req, res) => {
    try {
        const connection = await poolRead.getConnection();
        const [results] = await connection.query('SELECT cinema_id, cinema_name, cinema_ad, refund, allow_change FROM cinema');
        connection.release();
        res.json(results);
    } catch (error) {
        console.error('Error fetching cinemas:', error);
        res.status(500).json({ error: 'Failed to fetch cinemas' });
    }
});

// 查找场次
app.get('/api/session/:cinemaId', async (req, res) => {
    try {
        const cinemaId = req.params.cinemaId;
        const connection = await poolRead.getConnection();
        const [results] = await connection.query("SELECT room_name, movie_name, session_id, price, start_time, end_time FROM session JOIN room ON session.room_id = room.room_id JOIN movie ON session.movie_id = movie.movie_id WHERE session.cinema_id = ?", [cinemaId]);
        connection.release();
        res.json(results);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// 查找座位
app.get('/api/seats/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const connection = await poolRead.getConnection();
        const [results] = await connection.query('SELECT seat_row, seat_id, seat_state FROM inventory WHERE session_id = ?', [sessionId]);
        connection.release();
        res.json(results);
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
});

// 锁座逻辑
app.post('/api/payment', async (req, res) => {
    try {
        const { seats } = req.body;
        const seatsArray = JSON.parse(seats);

        const ReadConnection = await poolRead.getConnection();
        await ReadConnection.beginTransaction();

        // 检测座位是否已经被锁
        console.log(seats);
        for (const seat of seatsArray) {
            const [result] = await ReadConnection.query('SELECT seat_state FROM inventory WHERE session_id = ? AND seat_row = ? AND seat_id = ?', [2, seat.seat_row, seat.seat_id]);
            console.log(result);
            if (result[0].seat_state != 0) {
                ReadConnection.release();
                res.status(500).json({ success: false, error: '锁座失败，请稍后重试' });
            }
        }

        const connection = await poolWrite.getConnection();
        await connection.beginTransaction();

        // 插入一条记录以生成 orderId
        const [orderResult] = await connection.query('INSERT INTO orders (user_id, session_id, create_time, state, price) VALUES (?, ?, NOW(), 0, ?)', [1000000001, 2, 100.0]);
        const orderId = orderResult.insertId;

        await connection.commit();
        connection.release();

        // 发送锁座消息到消息队列
        await sendLockSeatMessage(orderId, seatsArray);

        res.json({ success: true, orderId });
    } catch (error) {
        console.error('Failed to process payment:', error);
        res.status(500).json({ success: false, error: '锁座失败，请稍后重试' });
    }
});

// 设置 Redis 键值对
app.post('/api/setRedis', async (req, res) => {
    try {
        const { orderId } = req.body;
        await redisClient.PSETEX(orderId.toString(), 20000, 'pending');
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to set Redis:', error);
        res.status(500).json({ success: false, error: '设置 Redis 失败' });
    }
});

// 检查支付状态
app.post('/api/checkPaymentStatus', async (req, res) => {
    try {
        const { orderId } = req.body;
        const ttl = await redisClient.ttl(orderId.toString());
        if (ttl === -2) {
            res.json({ status: 'timeout' });
        } else {
            res.json({ status: 'paid' });
        }
    } catch (error) {
        console.error('Failed to check Redis:', error);
        res.status(500).json({ status: 'error' });
    }
});


// 修改订单状态
app.post('/api/updateOrderStatus', async(req, res) => {    //????加了async
    try {
        const { orderId, status, selectedSeats} = req.body;

        const connection = await poolWrite.getConnection();//????
        await connection.beginTransaction();//????

        const updateQuery = 'UPDATE orders SET state = ? WHERE order_id = ?';//????
        await connection.query(updateQuery, [status, orderId]);//????
        
        await connection.commit();//????
        connection.release();//????
        
        if(status === 2)
        {
            for (const seat of selectedSeats) {
                await connection.query('INSERT INTO order_details (order_id, seat_row, seat_id, price) VALUES (?, ?, ?, ?)', [orderId, seat.seat_row, seat.seat_id, 50.0]);
            }
        }

        res.json({ success: true });      
    } catch (error) {
        console.error('Failed to update order status:', error);
        res.status(500).json({ success: false, error: '修改订单状态失败' });
    }
});

// 修改座位状态
app.post('/api/updateSeatState', async(req, res) => {
    try {
        const { orderId, state, selectedSeats} = req.body;
        // const seatsArray = JSON.parse(selectedSeats);
        // 修改 inventory 表中的该订单选中的 seat_state 为 state

        const connection = await poolWrite.getConnection();//????
        await connection.beginTransaction();//????

        // 在inventory表修改座位状态
        for (const seat of selectedSeats) {
            await connection.query('UPDATE inventory SET seat_state = ? WHERE session_id = ? AND seat_row = ? AND seat_id = ?', [state, 2, seat.seat_row, seat.seat_id]);
        }

        await connection.commit();//????
        connection.release();//????
        
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to update seat state:', error);
        res.status(500).json({ success: false, error: '修改座位状态失败' });
    }
});

// 负载均衡
// API endpoint
app.get('/', (req,res)=>{
    res.send("Welcome to GeeksforGeeks !");
});

// Launching application on several ports
// app.listen(3000);
app.listen(3001);
app.listen(3002);
app.listen(3003);

app.listen(port, err => {
    console.log(`Server running on port ${port}`);
    err ?
        console.log("Error in server setup") :
        console.log('Server listening on PORT 3000')
});
