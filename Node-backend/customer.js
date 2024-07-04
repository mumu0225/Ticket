const amqp = require('amqplib');
const mysql = require('mysql2/promise');

const poolWrite = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '20030225',
    database: 'CTSDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const startConsumer = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertQueue('lock-seat', { durable: false });

        channel.consume('lock-seat', async (msg) => {
            if (msg !== null) {
                const { orderId, seats } = JSON.parse(msg.content.toString());
                try {
                    const connection = await poolWrite.getConnection();
                    await connection.beginTransaction();

                    // 更新库存表中的座位状态为锁定
                    for (const seat of seats) {
                        await connection.query('UPDATE inventory SET seat_state = ? WHERE session_id = ? AND seat_row = ? AND seat_id = ?', [1, 2, seat.seat_row, seat.seat_id]);
                    }

                    // 提交事务
                    await connection.commit();
                    connection.release();

                    console.log(`Order ${orderId} seats locked successfully`);
                    channel.ack(msg);
                } catch (error) {
                    console.error(`Failed to lock seats for order ${orderId}:`, error);
                    channel.nack(msg, false, true);
                }
            }
        }, { noAck: false });

        console.log('Waiting for messages...');
    } catch (error) {
        console.error('Failed to start RabbitMQ consumer:', error);
    }
};

startConsumer();
