package es.vapa.servicedesk.common;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;
@MappedSuperclass @Getter @Setter
public abstract class BaseEntity {
  @Id @GeneratedValue private UUID id;
  private Instant createdAt = Instant.now();
  private Instant updatedAt = Instant.now();
  @PreUpdate public void preUpdate(){ this.updatedAt = Instant.now(); }
}
