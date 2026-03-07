import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid
} from '@mui/material';

const initialFormState = {
  name: '',
  description: '',
  price: '',
  category: '',
  quantity: ''
};

const getFormDataFromProduct = (product) => {
  if (!product) return initialFormState;
  return {
    name: product.name || '',
    description: product.description || '',
    price: product.price || '',
    category: product.category || '',
    quantity: product.quantity || ''
  };
};

export const ProductForm = ({ 
  onSubmit, 
  onCancel, 
  editingProduct = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState(() => getFormDataFromProduct(editingProduct));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    if (!editingProduct) {
      setFormData(initialFormState);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {editingProduct ? 'Edit Product' : 'Add New Product'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}
       key={editingProduct?.id || 'new'}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              multiline
              rows={2}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
              inputProps={{ step: "0.01", min: "0" }}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              inputProps={{ min: "0" }}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {editingProduct ? 'Update' : 'Create'}
              </Button>
              
              {editingProduct && (
                <Button
                  onClick={onCancel}
                  variant="outlined"
                  color="secondary"
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};