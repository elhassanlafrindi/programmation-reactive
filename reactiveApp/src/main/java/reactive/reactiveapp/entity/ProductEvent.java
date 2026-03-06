package reactive.reactiveapp.entity;

import java.time.Instant;
public record ProductEvent
        (ProductEventType eventType,
         Product payload,
         Instant timestamp)
{}