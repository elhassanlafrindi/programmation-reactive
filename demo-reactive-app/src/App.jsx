import React, { useEffect, useState } from 'react';
import { useProducts } from './page/produts/hooks/useProducts';
import { ProductForm } from './page/produts/components/ProductForm';
import { ProductTable } from './page/produts/components/ProductTable';
import { Alert, Box, Chip, CircularProgress, Container } from '@mui/material';
function App() {
  const [editingProduct, setEditingProduct] = useState(null);
  const [hideError, setHideError] = useState(false);

// Réafficher l'erreur quand une nouvelle arrive
useEffect(() => {
  if (error) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHideError(false);  // ✅ Affiche la nouvelle erreur
  }
},[]);
  const {
    products,
    loading,
    error,
    connected,
    createProduct,
    updateProduct,
    deleteProduct
  } = useProducts();

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        setEditingProduct(null);
      } else {
        await createProduct(formData);
      }
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header avec statut de connexion */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1 style={{ margin: 0 }}>Reactive Product Management</h1>
        <Chip
          label={connected ? '● Live' : '○ Offline'}
          color={connected ? 'success' : 'error'}
          variant="outlined"
        />
      </Box>

      {/* Error display */}
      {error && !hideError && (
  <Alert 
    severity="error" 
    sx={{ mb: 3 }} 
    onClose={() => setHideError(true)}  // ✅ Cache au clic
  >
    {error}
  </Alert>
)}

      {/* Loading overlay */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Product Form */}
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        editingProduct={editingProduct}
        loading={loading}
      />

      {/* Product Table */}
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={deleteProduct}
        loading={loading}
      />
    </Container>
  );
}

export default App;