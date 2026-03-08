function fn() {
  var env = karate.env; // get system property 'karate.env'
  karate.log('karate.env system property was:', env);
  
  if (!env) {
    env = 'dev';
  }
  
  var config = {
    baseUrl: 'http://localhost:8080',
    apiBase: 'http://localhost:8080/api/products'
  };
  
  if (env == 'dev') {
    config.baseUrl = 'http://localhost:8080';
    config.apiBase = 'http://localhost:8080/api/products';
  } else if (env == 'test') {
    config.baseUrl = 'http://localhost:8080';
    config.apiBase = 'http://localhost:8080/api/products';
  }
  
  return config;
}
