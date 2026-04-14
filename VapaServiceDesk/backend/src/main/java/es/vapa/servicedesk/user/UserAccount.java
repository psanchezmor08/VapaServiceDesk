package es.vapa.servicedesk.user;
import es.vapa.servicedesk.common.BaseEntity;
import es.vapa.servicedesk.tenant.Tenant;
import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
@Entity @Getter @Setter
@Table(indexes=@Index(name="idx_user_tenant_email", columnList="tenant_id,email"))
public class UserAccount extends BaseEntity {
  @ManyToOne(optional=false) private Tenant tenant;
  @Column(nullable=false) private String email;
  private String fullName;
  private String provider;
  private String providerUserId;
  @Enumerated(EnumType.STRING) private UserRole role = UserRole.REQUESTER;
}
