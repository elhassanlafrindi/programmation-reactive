import { useState, useEffect, useCallback, useRef } from 'react';
import ProductService from '../service/Productservice';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  // ✅ CORRECTION 2: Gestion centralisée des mises à jour SSE
  const handleProductEvent = useCallback(({ type, product }) => {
    setProducts(prevProducts => {
      switch (type) {
        case 'CREATED':
            
          if (prevProducts.some(p => p.id === product.id)) {
            console.log('Duplicate product event ignored:', product);
            return prevProducts;
          }
          return [product, ...prevProducts];

        case 'UPDATED':
          return prevProducts.map(p => 
            p.id === product.id ? { ...p, ...product } : p
          );

        case 'DELETED':
          return prevProducts.filter(p => p.id !== product.id);

        default:
          return prevProducts;
      }
    });
  }, []);


  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setConnected(false);
  }, []);

 
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD operations with optimistic updates
 const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const created = await ProductService.createProduct(productData);
      setProducts(prev => [created, ...prev]);  // ✅ Ajoute directement le produit créé
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id, productData) => {
    setLoading(true);
    setError(null);
    
    // Sauvegarder l'état précédent pour rollback
    const previousProducts = products;
    const updatedProduct = { ...productData, id };
    
    // Optimistic update
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updatedProduct } : p
    ));

    try {
      const result = await ProductService.updateProduct(id, productData);
      return result;
    } catch (err) {
      // Rollback
      setProducts(previousProducts);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products]);

  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    // Sauvegarder pour rollback
    const previousProducts = products;
    
    // Optimistic delete
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      await ProductService.deleteProduct(id);
    } catch (err) {
      // Rollback
      setProducts(previousProducts);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Setup SSE connection
  useEffect(() => {
    fetchProducts();

    const connectSSE = () => {
      const eventSource = ProductService.subscribeToProductEvents(
        handleProductEvent,
        handleError
      );
      
      eventSourceRef.current = eventSource;
      setConnected(true);

      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
      };
    };

    connectSSE();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [fetchProducts, handleProductEvent, handleError]);

  return {
    products,
    loading,
    error,
    connected,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
};