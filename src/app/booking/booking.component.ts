import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  selectedDesk: string | null = null;
  selectedBoardroom: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedDesk = params['desk'] || null;
      this.selectedBoardroom = params['boardroom'] || null;
    });
  }

  confirmBooking() {
    if (!this.selectedDesk && !this.selectedBoardroom) {
      alert("No desk or boardroom selected.");
      return;
    }

    // Simulate booking logic (save to backend or local storage)
    console.log("Booking confirmed:", {
      desk: this.selectedDesk,
      boardroom: this.selectedBoardroom
    });

    alert("Your spot has been booked successfully! 🎉");

    // Redirect back to the office map
    this.router.navigate(['/']);
  }
}
