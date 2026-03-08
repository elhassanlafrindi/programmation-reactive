Feature: Product API Tests
  Test the reactive product management API

Background:
  * url apiBase

Scenario: Create a new product and retrieve it by ID
  # Step 1: Create a new product
  Given path ''
  And header Content-Type = 'application/json'
  And request {
      name: 'Test Laptop',
      description: 'High performance laptop for development',
      price: 999.99,
      category: 'Electronics',
      quantity: 10
    }
  When method post
  Then status 200
  
  # Verify the created product response
  And def createdProduct = response
  Then match createdProduct.name == 'Test Laptop'
  And match createdProduct.description == 'High performance laptop for development'
  And match createdProduct.price == 999.99
  And match createdProduct.category == 'Electronics'
  And match createdProduct.quantity == 10
  And assert createdProduct.id != null
  And assert createdProduct.createdAt != null
  And assert createdProduct.updatedAt != null
  
  # Log the created product ID
  * def productId = createdProduct.id
  * print 'Created product with ID:', productId

  # Step 2: Get the product by ID
  Given path productId
  When method get
  Then status 200
  
  # Verify the retrieved product
  And def retrievedProduct = response
  Then match retrievedProduct.id == productId
  And match retrievedProduct.name == 'Test Laptop'
  And match retrievedProduct.description == 'High performance laptop for development'
  And match retrievedProduct.price == 999.99
  And match retrievedProduct.category == 'Electronics'
  And match retrievedProduct.quantity == 10

Scenario: Get all products
  Given path ''
  When method get
  Then status 200
  And assert response.length >= 1
  And print 'Total products:', response.length

Scenario: Update an existing product
  # First, create a product to update
  Given path ''
  And header Content-Type = 'application/json'
  And request {
      name: 'Product to Update',
      description: 'This will be updated',
      price: 50.00,
      category: 'Test',
      quantity: 5
    }
  When method post
  Then status 200
  
  And def productToUpdate = response
  And def updateProductId = productToUpdate.id
  
  # Update the product
  Given path updateProductId
  And header Content-Type = 'application/json'
  And request {
      name: 'Updated Product Name',
      description: 'Updated description',
      price: 75.50,
      category: 'Updated Category',
      quantity: 15
    }
  When method put
  Then status 200
  
  # Verify the update
  And def updatedProduct = response
  Then match updatedProduct.id == updateProductId
  And match updatedProduct.name == 'Updated Product Name'
  And match updatedProduct.description == 'Updated description'
  And match updatedProduct.price == 75.50
  And match updatedProduct.category == 'Updated Category'
  And match updatedProduct.quantity == 15

Scenario: Delete a product
  # First, create a product to delete
  Given path ''
  And header Content-Type = 'application/json'
  And request {
      name: 'Product to Delete',
      description: 'This will be deleted',
      price: 25.00,
      category: 'Temporary',
      quantity: 1
    }
  When method post
  Then status 200
  
  And def productToDelete = response
  And def deleteProductId = productToDelete.id
  
  # Delete the product
  Given path deleteProductId
  When method delete
  Then status 200
  
  # Verify the product is deleted (should return 404)
  Given path deleteProductId
  When method get
  Then status 404
