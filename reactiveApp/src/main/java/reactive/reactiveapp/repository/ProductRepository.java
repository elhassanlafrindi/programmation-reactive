package reactive.reactiveapp.repository;

import org.springframework.data.elasticsearch.repository.ReactiveElasticsearchRepository;
import org.springframework.stereotype.Repository;
import reactive.reactiveapp.entity.Product;
import reactor.core.publisher.Flux;

@Repository
public interface ProductRepository extends ReactiveElasticsearchRepository<Product, String> {
    Flux<Product> findByName(String name);
}