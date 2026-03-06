package reactive.reactiveapp.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactive.reactiveapp.entity.Product;
import reactive.reactiveapp.entity.ProductEvent;
import reactive.reactiveapp.service.ProductService;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


import org.springframework.http.HttpStatus;
@CrossOrigin(
        origins = "http://localhost:5173"
)
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Product> createProduct(@RequestBody Product product) {
        return service.createProduct(product);
    }

    @GetMapping
    public Flux<Product> getAllProducts() {
        return service.getAllProducts();
    }

    @GetMapping("/{id}")
    public Mono<Product> getProductById(@PathVariable String id) {
        return service.getProductById(id);
    }

    @PutMapping("/{id}")
    public Mono<Product> updateProduct(@PathVariable String id,
                                       @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public Mono<Product> deleteProduct(@PathVariable String id) {
        return service.deleteProduct(id);
    }

    // 📡 SSE LIVE STREAM
    @GetMapping(value = "/live", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<ProductEvent>> liveProducts() {
        return service.liveStream()
                .map(evt -> ServerSentEvent.<ProductEvent>builder()
                        // Removed .event("product") to use default message type
                        // This allows onmessage to receive the events
                        .data(evt)
                        .build());
    }
}