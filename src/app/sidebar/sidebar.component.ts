import { Component, Input } from '@angular/core';
import { SeatService } from '../seat.service';
import { DeskMapComponent } from '../desk-map/desk-map.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() selectedDesk: string | null = null;
  @Input() selectedBoardroom: string | null = null;
  bookedSeatsCount = 0;

  constructor(private seatService: SeatService ,private router: Router) {}

  ngOnInit() {
    this.seatService.bookedSeats$.subscribe(count => {
      this.bookedSeatsCount = count; // Update count in real time
    });
  }
  goToBooking() {
    if (!this.selectedDesk && !this.selectedBoardroom) {
      alert("Please select at least a desk or a boardroom before proceeding.");
      return;
    }
    
    // Navigate to booking page with selected options
    this.router.navigate(['/booking'], {
      queryParams: { desk: this.selectedDesk, boardroom: this.selectedBoardroom }
    });
  }
  
}
