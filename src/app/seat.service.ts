import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  //rxjs concept
  private bookedSeats = new BehaviorSubject<number>(0);
  bookedSeats$ = this.bookedSeats.asObservable(); // Observable for components to listen

  updateBookedSeats(count: number) {
    this.bookedSeats.next(count);
  }
  
}
