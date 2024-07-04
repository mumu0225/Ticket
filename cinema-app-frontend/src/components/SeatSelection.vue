<template>
    <div>
        <div ref="chart" style="width: 100%; height: 400px;"></div>
        <div v-if="selectedSeats.length > 0" style="margin-top: 20px;">
            当前选中座位坐标：
            <span v-for="(seat, index) in selectedSeats" :key="index">
                {{ seat.seat_row }}排{{ seat.seat_id }}座
                <span v-if="index !== selectedSeats.length - 1">, </span>
            </span>
        </div>
        <button @click="goToPayment" style="margin-top: 20px;">确定</button>
    </div>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';
const serverIp='localhost';//修改IP

export default {
    data() {
        return {
            chart: null,
            seats: [],
            selectedSeats: []
        };
    },
    mounted() {
        this.chart = echarts.init(this.$refs.chart);
        this.fetchAndDrawSeats();
        this.chart.on('click', (params) => this.handleClick(params));
    },
    methods: {
        async fetchAndDrawSeats() {
            try {
                const sessionId = this.$route.params.sessionId;
                const response = await axios.get(`http://${serverIp}:3000/api/seats/${sessionId}`);
                this.seats = response.data;

                const option = {
                    title: {
                        text: '选择座位'
                    },
                    tooltip: null,
                    grid: {
                        left: '10%',
                        right: '10%',
                        top: '10%',
                        bottom: '10%'
                    },
                    xAxis: {
                        type: 'category',
                        data: [...new Set(this.seats.map(seat => seat.seat_id))],
                        min: 1,
                        max: 4,
                        show: false
                    },
                    yAxis: {
                        type: 'category',
                        data: [...new Set(this.seats.map(seat => seat.seat_row))].reverse(),
                        min: 1,
                        max: 3,
                        show: false
                    },
                    series: [{
                        type: 'custom',
                        renderItem: (params, api) => {
                            const seatState = this.seats[params.dataIndex].seat_state;
                            let image;
                            if (seatState === 0) {
                                image = '/assets/seat_none.png';
                            } else if (seatState === 1) {
                                image = '/assets/seat_sold.png';
                            } else if (seatState === 2) {
                                image = '/assets/seat_choose.png';
                            }
                            return {
                                type: 'image',
                                style: {
                                    image: image,
                                    x: api.coord([api.value(0), api.value(1)])[0] - 10,
                                    y: api.coord([api.value(0), api.value(1)])[1] - 10,
                                    width: 35,
                                    height: 35
                                }
                            };
                        },
                        data: this.seats.map(seat => [seat.seat_id, seat.seat_row])
                    }]
                };

                this.chart.setOption(option);
            } catch (error) {
                console.error('Failed to fetch and draw seats:', error);
            }
        },
        handleClick(params) {
            const seatIndex = params.dataIndex;
            const selectedSeat = this.seats[seatIndex];
            const index = this.selectedSeats.findIndex(seat => seat.seat_id === selectedSeat.seat_id && seat.seat_row === selectedSeat.seat_row);

            if (this.selectedSeats.length >= 6 && selectedSeat.seat_state != 2) {
                // 如果已选座位数量大于等于6，则不再处理点击事件并提示信息
                alert('您最多只能选择6个座位');
                return;
            }

            if (selectedSeat.seat_state === 0) {
                // 检查选中的座位与已选座位同一排且连续
                if (!this.isSeatInSameRowAndContinous(selectedSeat)) {
                    alert('所选座位中间不能有空位');
                    return;
                }

                selectedSeat.seat_state = 2;
                if (index === -1) {
                    this.selectedSeats.push(selectedSeat);
                }
            } else if (selectedSeat.seat_state === 2) {
                selectedSeat.seat_state = 0;
                if (index !== -1) {
                    this.selectedSeats.splice(index, 1);
                }
            }
            this.updateChart();
        },

        isSeatInSameRowAndContinous(seat) {
            // 判断选中的座位是否与已选座位同一排且连续
            if (this.selectedSeats.length === 0) {
                return true;
            }
            var k = 0;
            var num = 0;
            for (var i = 0; i < this.selectedSeats.length; i++) {
                if (this.selectedSeats[i].seat_row == seat.seat_row && Math.abs(this.selectedSeats[i].seat_id - seat.seat_id) == 1) {
                    k = 1;
                }
                if (this.selectedSeats[i].seat_row != seat.seat_row) {
                    num++;
                    continue;
                }
            }
            if (num == this.selectedSeats.length) {
                k = 1;
            }
            if (k == 0)
                return false;
            else
                return true;
        },

        updateChart() {
            const newOption = {
                series: [{
                    data: this.seats.map(seat => {
                        return {
                            value: [seat.seat_id, seat.seat_row],
                            itemStyle: {
                                color: seat.seat_state === 0 ? '#fff' : seat.seat_state === 1 ? '#f00' : '#0f0'
                            }
                        };
                    })
                }]
            };
            this.chart.setOption(newOption);
        },

        async goToPayment() {
            if(this.selectedSeats.length === 0)
                {
                    alert("至少选择一个座位！");
                }
            else{
                try {
                    const seats = JSON.stringify(this.selectedSeats);
                    const response = await axios.post(`http://${serverIp}:3000/api/payment`, { seats });

                    if (response.data.success) {
                        const orderId = response.data.orderId;
                        this.$router.push({ name: 'payment', query: { seats: JSON.stringify(this.selectedSeats), orderId: orderId } });
                        console.log("seatselection:"+orderId);
                    } else {
                        alert('锁座失败：' + response.data.error);
                    }
                } catch (error) {
                    console.error('Failed to process payment:', error);
                    alert('锁座失败，请稍后重试');
                }
            }
        }
    }

};
</script>

<style>
/* 可以添加样式来调整座位图的外观 */
</style>
