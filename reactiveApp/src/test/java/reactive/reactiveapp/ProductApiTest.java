package reactive.reactiveapp;

import com.intuit.karate.Results;
import com.intuit.karate.junit5.Karate;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ProductApiTest {

    @Test
    void testProductApi() {
        Results results = Karate.run("classpath:reactive/reactiveapp/product")
                .relativeTo(getClass())
                .outputCucumberJson(true)
                .outputHtmlReport(true)
                .parallel(1);
        
        assertEquals(0,
                results.getFeaturesFailed(),
                "Tests failed: " + results.getErrorMessages());
    }
}
