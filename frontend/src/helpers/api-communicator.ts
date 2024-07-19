import axios from "axios"

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await axios.post('/user/login', { email, password });
    if (res.status !== 200) {
      throw new Error(`Unable to login, received status code: ${res.status}`);
    }
    const data = await res.data;
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export const checkAuthStatus = async () => {
    try {
      const res = await axios.get('/user/auth-status');
      if (res.status !== 200) {
        throw new Error(`Unable to Authenticate`);
      }
      const data = await res.data;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
