import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/products';

class ProductService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // CRUD Operations
  async getAllProducts() {
    try {
      const response = await this.api.get('');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProductById(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createProduct(productData) {
    try {
      const response = await this.api.post('', this.formatProductData(productData));
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProduct(id, productData) {
    try {
      const response = await this.api.put(`/${id}`, this.formatProductData(productData));
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteProduct(id) {
    try {
      const response = await this.api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }


  subscribeToProductEvents(onMessage, onError) {
    const eventSource = new EventSource(`${API_BASE_URL}/live`);
    
    eventSource.onmessage = (event) => {
      try {
        const productEvent = JSON.parse(event.data);
        
        // Ignore heartbeats
        if (productEvent.eventType === 'HEARTBEAT') {
          return;
        }

        onMessage({
          type: productEvent.eventType,
          product: productEvent.payload,
          timestamp: productEvent.timestamp
        });
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = () => {
      if (onError) {
        onError('Lost connection to server. Attempting to reconnect...');
      }
      // Close and attempt reconnection
      eventSource.close();
    };

    return eventSource;
  }


  formatProductData(data) {
    return {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price) || 0,
      category: data.category,
      quantity: parseInt(data.quantity) || 0
    };
  }

  handleError(error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'An unexpected error occurred';
    throw new Error(message);
  }
}


export default new ProductService();