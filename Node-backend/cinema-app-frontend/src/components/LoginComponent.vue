<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <label>Username:</label>
      <input type="text" v-model="username" required><br>
      <label>Password:</label>
      <input type="password" v-model="password" required><br>
      <button type="submit">Login</button>
    </form>
    <p v-if="error" style="color: red;">{{ error }}</p>
    <p v-if="token">Token: {{ token }}</p>
  </div> 
</template>


<script>
import axios from 'axios';
export default {
  data() {
    return {
      username: '',
      password: '',
      token: '',
      error: ''
    };
  },
  methods: {
    login() {
      console.log("Username: " + this.username);
      console.log("Password: " + this.password);
      axios.post('http://localhost:9090/api/login', {
        username: this.username,
        password: this.password
      })
      .then(response => {
        this.token = response.data.token;
        this.$router.push('/');
        this.error = '';
      })
      .catch(error => {
        this.token = '';
        this.error = error.response.data.message;
      });
    }
  }
};
</script>

<style>
/* Add your styles here */
body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  margin: 0;
  background-color: #f0f2f5;
}

#login-form {
  max-width: 10px;
  width: 100%;
  padding: 2em;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  text-align: center;
  margin-bottom: 1.5em;
  color: #333;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5em;
  color: #333;
}

input[type="text"],
input[type="password"] {
  padding: 0.75em;
  margin-bottom: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.75em;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 1em;
}

p {
  text-align: center;
}
</style>
