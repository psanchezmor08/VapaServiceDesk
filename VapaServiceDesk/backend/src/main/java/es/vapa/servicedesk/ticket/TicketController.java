package es.vapa.servicedesk.ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/tickets") @RequiredArgsConstructor
public class TicketController {
  private final TicketRepository ticketRepository;
  @GetMapping public List<Ticket> list(@RequestHeader("X-Tenant-Slug") String tenantSlug){ return ticketRepository.findByTenant_Slug(tenantSlug); }
}
