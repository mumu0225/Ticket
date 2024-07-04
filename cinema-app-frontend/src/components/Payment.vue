<template>
    <div>
        <h2>支付订单</h2>
        <div v-if="selectedSeats.length > 0">
            <h3>您选择的座位：</h3>
            <ul>
                <li v-for="(seat, index) in selectedSeats" :key="index">
                    {{ seat.seat_row }}排{{ seat.seat_id }}座
                </li>
            </ul>
            <button @click="handlePayment">支付</button>
        </div>
        <div v-else>
            <p>没有选择座位</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
const serverIp='localhost';//修改IP

export default {
    name: 'PaymentPage',
    data() {
        return {
            selectedSeats: [],
            orderId: null, // 初始 orderId 为空
            checkInterval: null, // 定时器ID
        };
    },
    created() {
        const seats = this.$route.query.seats;
        if (seats) {
            this.selectedSeats = JSON.parse(seats);
        }

        // 从路由参数中获取 orderId
        this.orderId = this.$route.query.orderId;
        if (this.orderId) {
            this.createRedisKey();
        } else {
            alert('订单ID未找到');
        }
    },
    beforeUnmount() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    },
    methods: {
        async createRedisKey() {
            try {
                // 设置 Redis 键值，生命周期为 5 秒
                await axios.post(`http://${serverIp}:3000/api/setRedis`, { orderId: this.orderId });
                // 启动定时器每秒检查订单状态
                this.startCheckingPaymentStatus();
            } catch (error) {
                console.error('设置 Redis 失败:', error);
                alert('设置 Redis 失败，请稍后重试');
            }
        },
        startCheckingPaymentStatus() {
            this.checkInterval = setInterval(async () => {
                try {
                    const checkResponse = await axios.post(`http://${serverIp}:3000/api/checkPaymentStatus`, { orderId: this.orderId });
                    if (checkResponse.data.status === 'timeout') {
                        // 修改 inventory 表中的该订单选中的 seat_state 为 0
                        await axios.post(`http://${serverIp}:3000/api/updateSeatState`, { orderId: this.orderId, state: 0, selectedSeats: this.selectedSeats });
                        // 修改数据库订单状态为 3，已取消
                        await axios.post(`http://${serverIp}:3000/api/updateOrderStatus`, { orderId: this.orderId, status: 3, selectedSeats: this.selectedSeats});
                        alert('支付超时！');
                        this.$router.push('/seat-selection/2');
                        // 停止定时器
                        clearInterval(this.checkInterval);
                    } else {
                        console.log('订单状态未变，继续检测');
                    }
                } catch (error) {
                    console.error('检查支付状态失败:', error);
                }
            }, 1000); // 每秒检测一次
        },
        async handlePayment() {
            try {
                // 处理支付逻辑
                console.log("payment:" + this.orderId);
                const checkResponse = await axios.post(`http://${serverIp}:3000/api/checkPaymentStatus`, { orderId: this.orderId });
                console.log(checkResponse.data.status);
                if (checkResponse.data.status === 'paid') {
                    // 修改数据库订单状态为 2，支付成功
                    await axios.post(`http://${serverIp}:3000/api/updateOrderStatus`, { orderId: this.orderId, status: 2 ,selectedSeats: this.selectedSeats});
                    // 修改 inventory 表中的该订单选中的 seat_state 为 1
                    await axios.post(`http://${serverIp}:3000/api/updateSeatState`, { orderId: this.orderId, state: 1, selectedSeats: this.selectedSeats });
                    alert('支付成功！');
                    // 支付成功后跳转到订单详情页或者其他页面
                    this.$router.push('/');
                } else {
                    // 修改 inventory 表中的该订单选中的 seat_state 为 0
                    await axios.post(`http://${serverIp}:3000/api/updateSeatState`, { orderId: this.orderId, state: 0, selectedSeats: this.selectedSeats });
                    // 修改数据库订单状态为 3，已取消
                    await axios.post(`http://${serverIp}:3000/api/updateOrderStatus`, { orderId: this.orderId, status: 3 ,selectedSeats: this.selectedSeats});
                    alert('支付超时！');
                    this.$router.push('/seat-selection/2');
                }
            } catch (error) {
                console.error('检查支付状态失败:', error);
                alert('检查支付状态失败，请稍后重试');
            }
        }
    }
};
</script>

<style>
/* 可以添加样式来调整支付订单界面的外观 */
</style>
