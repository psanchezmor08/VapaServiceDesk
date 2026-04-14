package es.vapa.servicedesk.ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; import java.util.UUID;
public interface TicketRepository extends JpaRepository<Ticket, UUID> { List<Ticket> findByTenant_Slug(String slug); }
