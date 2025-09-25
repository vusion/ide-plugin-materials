import instance from './http';

// 封装GET请求
export function get(url, params, signal = null) {
  const config = signal ? { signal } : {};
  return instance
    .get(url, { params, ...config })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

// 封装POST请求
export function post(url, data) {
  return instance
    .post(url, data)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

// put
export function put(url, data) {
  return instance
    .put(url, data)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}
//delete
export function del(url) {
  return instance
    .delete(url)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}
