package es.vapa.servicedesk.tenant;
import es.vapa.servicedesk.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
@Entity @Getter @Setter
public class Tenant extends BaseEntity {
  @Column(unique = true, nullable = false) private String slug;
  @Column(nullable = false) private String companyName;
  private String domain;
  private boolean active = true;
}
