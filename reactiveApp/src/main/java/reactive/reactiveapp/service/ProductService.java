package reactive.reactiveapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactive.reactiveapp.entity.Product;
import reactive.reactiveapp.entity.ProductEvent;
import reactive.reactiveapp.entity.ProductEventType;
import reactive.reactiveapp.repository.ProductRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;

    private final Sinks.Many<ProductEvent> sink =
            Sinks.many().multicast().onBackpressureBuffer();

    public Flux<ProductEvent> liveStream() {

        return sink.asFlux()
                .mergeWith(Flux.interval(Duration.ofSeconds(10))
                .map(i-> new ProductEvent(
                        ProductEventType.HEARTBEAT,
                        null,
                        Instant.now())));
    }


    public Mono<Product> createProduct(Product product) {
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());

        return repository.save(product)
                .doOnNext(saved ->
                        sink.tryEmitNext(new ProductEvent(
                            ProductEventType.CREATED,saved,Instant.now()
                )))
                .doOnNext(saved ->System.out.println("🔥 Product saved: " + saved));

    }

    public Flux<Product> getAllProducts() {
        return repository.findAll();
    }


    public Mono<Product> getProductById(String id) {
        return repository.findById(id);
    }


    public Mono<Product> updateProduct(String id, Product product) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Product not found: " + id)))
                .flatMap(existing -> {
                    existing.setName(product.getName());
                    existing.setDescription(product.getDescription());
                    existing.setPrice(product.getPrice());
                    existing.setCategory(product.getCategory());
                    existing.setQuantity(product.getQuantity());
                    existing.setUpdatedAt(Instant.now());
                    return repository.save(existing);
                })
                .doOnNext(updated -> sink.tryEmitNext(
                        new ProductEvent(ProductEventType.UPDATED, updated, Instant.now())
                ));
    }

    public Mono<Product> deleteProduct(String id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Product not found: " + id)))
                .flatMap(product ->
                        repository.delete(product)
                                .thenReturn(product)
                )
                .doOnNext(deleted -> sink.tryEmitNext(
                        new ProductEvent(ProductEventType.DELETED,deleted, Instant.now())
                ));
    }
}