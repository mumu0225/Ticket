<template>
  
  <div class="session-list">

    <h2 class="session-list-header">场次列表</h2>
    <div v-for="session in sessions" :key="session.session_id" class="session-cell">
      <h3>{{ session.movie_name }}</h3>
      <p>{{ formatTime(session.start_time) }} —— {{ formatTime(session.end_time) }}</p>
      <p>价格：￥{{ session.price }}</p>
      <p>放映厅：{{ session.room_name }}</p>
      <router-link :to="{ name: 'seat-selection', params: { sessionId: session.session_id }}">
        <a-button type="primary">选择座位</a-button>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
//import { Button as AButton } from 'ant-design-vue'
const serverIp='localhost';//修改IP

export default {
  data() {
    return {
      sessions: []
    };
  },
  created() {
    axios.get(`http://${serverIp}:3000/api/session/${this.$route.params.cinemaId}`)
      .then(response => {
        this.sessions = response.data;
      })
      .catch(error => {
        console.error(error);
      });
  },
  methods: {
    formatTime(time) {
      const date = new Date(time);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${this.padZero(month)}-${this.padZero(day)} ${this.padZero(hours)}:${this.padZero(minutes)}:00`;
    },
    padZero(num) {
      return num.toString().padStart(2, '0');
    },
    selectSeat(sessionId) {
      this.$router.push({ name: 'seat-selection', params: { sessionId: sessionId } });
    }
  }
};
</script>

<style>
/* Add your styles for the session list here */
.session-list { 
  display: flex;
  flex-direction:column ;
  align-items: center;
}

.session-list-header {
  text-align: center;
  margin-top: 20px;
  font-size: 24px;
}

.session-cell {
  width: 150%;
  border: 1px solid #ccc;
  padding: 20px;
  margin-top: 20px;
  
  text-align: center;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h3 {
  font-size: 20px;
  margin-bottom: 5px;
}

p {
  margin: 5px 0;
}

.router-link {
  display: block;
  text-align: center;
  margin-top: 10px;
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
  transition: color 0.3s ease;
}

.router-link:hover {
  color: #0056b3;
}
</style>