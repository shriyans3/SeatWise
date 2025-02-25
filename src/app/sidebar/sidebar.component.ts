import { Component } from '@angular/core';
import { SeatService } from '../seat.service';
import { DeskMapComponent } from '../desk-map/desk-map.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  bookedSeatsCount = 0;

  constructor(private seatService: SeatService ) {
    this.seatService.bookedSeats$.subscribe(count => {
      this.bookedSeatsCount = count; // Update count in real time
    });
  }

  
}
