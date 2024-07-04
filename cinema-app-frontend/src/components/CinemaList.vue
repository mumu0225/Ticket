<template>
    <div class="cinema-list">
      <div>
      <h1>{{ message }}</h1> 
      </div>
      <div v-for="cinema in cinemas" :key="cinema.cinema_id" class="cinema-cell">
        <div class="cinema-info">
          <h3 class="cinema-name">{{ cinema.cinema_name }}</h3>
          <p class="cinema-address">地址：{{ cinema.cinema_ad }}</p>
          <p class="cinema-refund">支持退票：{{ cinema.refund ? '是' : '否' }}</p>
          <p class="cinema-allow-change">支持改签：{{ cinema.allow_change ? '是' : '否' }}</p>
          <router-link :to="{ name: 'session-selection', params: { cinemaId: cinema.cinema_id }}">
            <a-button type="primary">选择场次</a-button>
          </router-link>
        </div>
      </div> 
    </div> 
  </template> 


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useMainStore } from '../store/useMainStore'//

import { Button as AButton } from 'ant-design-vue'

const mainStore = useMainStore()//
const message = mainStore.message //
const cinemas = ref([])
const serverIp = 'localhost'//修改ip

onMounted(() => {
  axios.get(`http://${serverIp}:3000/api/cinema`)
    .then(response => {
      cinemas.value = response.data
    })
    .catch(error => {
      console.error(error)
    })
})
</script>


<style>
  .cinema-list {
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.cinemas-list-header {
  text-align: center;
  margin-top: 20px;
  font-size: 24px;
}

.cinema-cell {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cinema-info {
  text-align: left;
}

.cinema-name {
  font-size: 20px;
  margin-bottom: 5px;
}

.cinema-address,
.cinema-refund,
.cinema-allow-change {
  margin: 5px 0;
  font-size: 16px;
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