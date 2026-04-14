package es.vapa.servicedesk.ticket;
import es.vapa.servicedesk.common.BaseEntity;
import es.vapa.servicedesk.tenant.Tenant;
import es.vapa.servicedesk.user.UserAccount;
import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
@Entity @Getter @Setter
@Table(indexes=@Index(name="idx_ticket_tenant_status", columnList="tenant_id,status"))
public class Ticket extends BaseEntity {
  @ManyToOne(optional=false) private Tenant tenant;
  @ManyToOne(optional=false) private UserAccount requester;
  @ManyToOne private UserAccount assignee;
  private String subject;
  @Column(length=5000) private String description;
  @Enumerated(EnumType.STRING) private TicketStatus status = TicketStatus.OPEN;
  @Enumerated(EnumType.STRING) private TicketPriority priority = TicketPriority.MEDIUM;
}
