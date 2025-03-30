import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const register = async (userData) => {
  return axios.post(`${API_URL}/register/`, userData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const login = async (credentials) => {
  return axios.post(`${API_URL}/login/`, credentials, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const getProfile = async (token) => {
  return axios.get(`${API_URL}/users/me/`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const logout = async (token) => {
  return axios.post(`${API_URL}/logout/`, null, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// api.js
export const createPortfolio = async (token, name) => {
  return axios.post(
    `${API_URL}/portfolios/`, 
    { name },
    { 
      headers: { 
        Authorization: `Bearer ${token}`, // Токен должен быть здесь
        'Content-Type': 'application/json'
      }
    }
  );
};

export const getPortfolios = async (token) => {
  if (!token) throw new Error("Токен отсутствует");
  
  return axios.get(`${API_URL}/portfolios/`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const addCryptoToPortfolio = async (token, portfolioId, cryptoData) => {
  return axios.post(
    `${API_URL}/portfolios/${portfolioId}/crypto`,
    cryptoData,
    { 
      headers: { 
        'Authorization': `Bearer ${token}`, // Добавлено "Bearer"
        'Content-Type': 'application/json'
      }
    }
  );
};

export const deletePortfolio = async (token, portfolioId) => {
  return axios.delete(
    `${API_URL}/portfolios/${portfolioId}`,
    { headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }}
  );
};

// Дополнительные методы (при необходимости)
export const getPortfolioDetails = async (token, portfolioId) => {
  return axios.get(
    `${API_URL}/portfolios/${portfolioId}`,
    { headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }}
  );
};

// api.js
export const deleteCryptoFromPortfolio = async (token, portfolioId, cryptoId) => {
  return axios.delete(
    `${API_URL}/portfolios/${portfolioId}/crypto/${cryptoId}`,
    { 
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
};