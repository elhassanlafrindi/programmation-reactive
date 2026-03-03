package reactive.reactiveapp.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactive.reactiveapp.entity.Product;
import reactive.reactiveapp.service.ProductService;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    // ✅ CREATE
    @PostMapping
    public Mono<Product> createProduct(@RequestBody Product product) {
        return service.createProduct(product);
    }

    // 📥 GET ALL
    @GetMapping
    public Flux<Product> getAllProducts() {
        return service.getAllProducts();
    }

    // 🔍 GET BY ID
    @GetMapping("/{id}")
    public Mono<Product> getProductById(@PathVariable String id) {
        return service.getProductById(id);
    }

    // ✏️ UPDATE
    @PutMapping("/{id}")
    public Mono<Product> updateProduct(@PathVariable String id,
                                       @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    // ❌ DELETE
    @DeleteMapping("/{id}")
    public Mono<Product> deleteProduct(@PathVariable String id) {
        return service.deleteProduct(id);
    }

    @GetMapping(value = "/live", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Product> liveProducts() {
        return service.liveStream()
                .doOnCancel(() -> System.out.println("Client disconnected"))
                .doOnSubscribe(sub -> System.out.println("Client connected"));
    }
}