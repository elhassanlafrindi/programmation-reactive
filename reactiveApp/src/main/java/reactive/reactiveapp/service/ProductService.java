package reactive.reactiveapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactive.reactiveapp.entity.Product;
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

    // 🔥 Stream temps réel (multicast = plusieurs clients)
    private final Sinks.Many<Product> sink =
            Sinks.many().multicast().onBackpressureBuffer();

    public Flux<Product> liveStream() {
        return sink.asFlux()
                .mergeWith(Flux.interval(Duration.ofSeconds(1))
                        .map(i -> new Product())); // dummy heartbeat
    }

    // ✅ CREATE
    public Mono<Product> createProduct(Product product) {
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());

        return repository.save(product)
                .doOnNext(saved -> sink.tryEmitNext(saved)); // 🔥 push event
    }

    // 📥 GET ALL
    public Flux<Product> getAllProducts() {
        return repository.findAll();
    }

    // 🔍 GET BY ID
    public Mono<Product> getProductById(String id) {
        return repository.findById(id);
    }

    // ✏️ UPDATE
    public Mono<Product> updateProduct(String id, Product product) {
        return repository.findById(id)
                .flatMap(existing -> {
                    existing.setName(product.getName());
                    existing.setDescription(product.getDescription());
                    existing.setPrice(product.getPrice());
                    existing.setCategory(product.getCategory());
                    existing.setQuantity(product.getQuantity());
                    existing.setUpdatedAt(Instant.now());

                    return repository.save(existing);
                })
                .doOnNext(updated -> sink.tryEmitNext(updated)); // 🔥 push update
    }

    // ❌ DELETE
    public Mono<Product> deleteProduct(String id) {
        return repository.findById(id)
                .flatMap(product ->
                        repository.deleteById(id)
                                .thenReturn(product) // Return the deleted product
                                .doOnSuccess(deletedProduct -> 
                                        sink.tryEmitNext(deletedProduct)) // 🔥 notify delete
                );
    }
}