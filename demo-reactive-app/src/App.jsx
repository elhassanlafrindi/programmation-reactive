/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

const API_BASE_URL = 'http://localhost:8080/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eventSource, setEventSource] = useState(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and fetch products on component mount
  useEffect(() => {
    fetchProducts();

    // Set up Server-Sent Events for real-time updates
    let es;
    let reconnectTimeout;

    const connectSSE = () => {
      try {
        es = new EventSource(`${API_BASE_URL}/live`);
        
        es.onmessage = (event) => {
          try {
            const updatedProduct = JSON.parse(event.data);
            
            // Update the products list optimistically
            setProducts(prevProducts => {
              const existingIndex = prevProducts.findIndex(p => p.id === updatedProduct.id);
              
              if (existingIndex >= 0) {
                // Update existing product
                const newProducts = [...prevProducts];
                newProducts[existingIndex] = updatedProduct;
                return newProducts;
              } else {
                // Add new product
                return [...prevProducts, updatedProduct];
              }
            });
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };
        
        es.onerror = (error) => {
          console.error('SSE Error:', error);
          setError('Could not connect to real-time updates. Please ensure the backend is running on http://localhost:8080');
          
          // Attempt to reconnect after delay
          if (es) {
            es.close();
          }
          reconnectTimeout = setTimeout(connectSSE, 5000); // Retry every 5 seconds
        };

        setEventSource(es);
      } catch (error) {
        console.error('Failed to create EventSource:', error);
        setError('Server-Sent Events are not supported or backend is not running.');
      }
    };

    connectSSE();

    // Cleanup on component unmount
    return () => {
      if (es) {
        es.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing product
        await axios.put(`${API_BASE_URL}/${editingId}`, {
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity)
        });
      } else {
        // Create new product
        await axios.post(API_BASE_URL, {
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity)
        });
      }

      // Reset form
      setFormData({ name: '', description: '', price: '', category: '', quantity: '' });
      setEditingId(null);
      
      // Products will be updated via SSE
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      quantity: product.quantity || ''
    });
    setEditingId(product.id);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/${id}`);
      // Product will be removed via SSE
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      console.error('Error deleting product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({ name: '', description: '', price: '', category: '', quantity: '' });
    setEditingId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Reactive Product Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <CircularProgress />}

      {/* Form for creating/updating products */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {editingId ? 'Edit Product' : 'Add New Product'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ minWidth: 200 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            sx={{ minWidth: 200 }}
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            required
            sx={{ minWidth: 150 }}
          />
          <TextField
            fullWidth
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            sx={{ minWidth: 150 }}
          />
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            sx={{ minWidth: 150 }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {editingId ? 'Update' : 'Create'}
            </Button>
            {editingId && (
              <Button onClick={handleCancel} variant="outlined" color="secondary" disabled={loading}>
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Products table */}
      <Paper elevation={3}>
        <Typography variant="h5" sx={{ p: 2 }} gutterBottom>
          Products ({products.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleEdit(product)}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="outlined"
                      color="error"
                      size="small"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default App;
