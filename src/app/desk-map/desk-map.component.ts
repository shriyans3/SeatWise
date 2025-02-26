import { Component, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { SeatService } from '../seat.service';

@Component({
  selector: 'app-desk-map',
  templateUrl: './desk-map.component.html',
  styleUrls: ['./desk-map.component.css']
})
export class DeskMapComponent implements AfterViewInit {
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef;
  
  @Output() selectedDesk = new EventEmitter<string | null>();
  @Output() selectedBoardroom = new EventEmitter<string | null>();

  bookedSeats: Set<string> = new Set();
  imageState: { [key: string]: string } = {};
  
  draggingElement: SVGImageElement | null = null;
  offsetX: number = 0;
  offsetY: number = 0;
  
  currentlyBookedSeat: SVGElement | null = null;
  currentlyBookedManagerDesk: SVGImageElement | null = null;

  constructor(private seatService: SeatService) {}

  ngAfterViewInit() {
    this.loadSVG();
  }

  loadSVG() {
    fetch('office-map.svg')
      .then(response => response.text())
      .then(svgData => {
        this.svgContainer.nativeElement.innerHTML = svgData;
        this.attachSeatClickEvents();
        this.attachManagerClickEvents();
        this.makeDraggable();
        this.makeImagesClickable();
      })
      .catch(error => console.error('Error loading SVG:', error));
  }

  attachSeatClickEvents() {
    const seats = this.svgContainer.nativeElement.querySelectorAll('.desk');

    seats.forEach((seat: SVGElement) => {
      seat.addEventListener('click', () => {
        const seatId = seat.id;

        if (this.currentlyBookedSeat === seat) {
          seat.setAttribute('data-booked', 'false');
          seat.setAttribute('fill', 'white'); // Unbook seat
          this.currentlyBookedSeat = null;
          this.selectedDesk.emit(null);
        } else {
          if (this.currentlyBookedSeat) {
            this.currentlyBookedSeat.setAttribute('data-booked', 'false');
            this.currentlyBookedSeat.setAttribute('fill', 'white');
          }

          seat.setAttribute('data-booked', 'true');
          seat.setAttribute('fill', 'red');
          this.currentlyBookedSeat = seat;
          this.selectedDesk.emit(seatId);
        }

        this.seatService.updateBookedSeats(this.currentlyBookedSeat ? 1 : 0);
      });

      seat.addEventListener('mouseover', () => {
        if (seat.getAttribute('data-booked') !== 'true') {
          seat.setAttribute('fill', 'grey'); 
        }
      });

      seat.addEventListener('mouseout', () => {
        if (seat.getAttribute('data-booked') !== 'true') {
          seat.setAttribute('fill', 'white'); 
        }
      });
    });
  }

  attachManagerClickEvents() {
    const managerDesks = this.svgContainer.nativeElement.querySelectorAll('.manager');

    managerDesks.forEach((desk: SVGImageElement) => {
      desk.addEventListener('click', () => {
        if (this.currentlyBookedManagerDesk === desk) {
          desk.setAttribute('data-booked', 'false');
          desk.setAttribute('href', 'manager-desk.png'); // Reset image
          this.currentlyBookedManagerDesk = null;
          this.selectedBoardroom.emit(null);
        } else {
          if (this.currentlyBookedManagerDesk) {
            this.currentlyBookedManagerDesk.setAttribute('data-booked', 'false');
            this.currentlyBookedManagerDesk.setAttribute('href', 'manager-desk.png');
          }

          desk.setAttribute('data-booked', 'true');
          desk.setAttribute('href', 'desk.png'); // Set booked image
          this.currentlyBookedManagerDesk = desk;
          this.selectedBoardroom.emit(desk.id);
        }
      });
    });
  }

  makeImagesClickable() {
    const images = this.svgContainer.nativeElement.querySelectorAll('image');

    images.forEach((image: SVGImageElement) => {
      image.addEventListener('click', () => this.toggleImage(image));
    });
  }

  toggleImage(image: SVGImageElement) {
    const currentSrc = image.getAttribute('href');

    if (currentSrc === 'desk.png') {
      image.setAttribute('href', 'empty-desk.png'); 
    } else if (currentSrc === 'empty-desk.png') {
      image.setAttribute('href', 'desk.png'); 
    } else if (currentSrc === 'filled.png') {
      image.setAttribute('href', 'unfilled.png'); 
    } else if (currentSrc === 'unfilled.png') {
      image.setAttribute('href', 'filled.png'); 
    }
  }

  makeDraggable() {
    const images = this.svgContainer.nativeElement.querySelectorAll('.draggable');

    images.forEach((image: SVGImageElement) => {
      image.addEventListener('mousedown', (event: MouseEvent) => this.startDrag(event, image));
    });

    document.addEventListener('mousemove', (event: MouseEvent) => this.drag(event));
    document.addEventListener('mouseup', () => this.endDrag());
  }

  startDrag(event: MouseEvent, image: SVGImageElement) {
    this.draggingElement = image;
    
    const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
    const imageX = parseFloat(image.getAttribute('x') || '0');
    const imageY = parseFloat(image.getAttribute('y') || '0');

    this.offsetX = event.clientX - svgRect.left - imageX;
    this.offsetY = event.clientY - svgRect.top - imageY;
  }

  drag(event: MouseEvent) {
    if (this.draggingElement) {
      const gridSize = 80; 
      const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
      let newX = event.clientX - svgRect.left - this.offsetX;
      let newY = event.clientY - svgRect.top - this.offsetY;

      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;

      this.draggingElement.setAttribute('x', `${newX}`);
      this.draggingElement.setAttribute('y', `${newY}`);
    }
  }

  endDrag() {
    this.draggingElement = null;
  }

  resetBookings() {
    this.bookedSeats.clear();

    const seats = this.svgContainer.nativeElement.querySelectorAll('.desk');
    seats.forEach((seat: SVGElement) => {
      seat.setAttribute('fill', 'white');
    });

    const managerDesks = this.svgContainer.nativeElement.querySelectorAll('.manager');
    managerDesks.forEach((desk: SVGImageElement) => {
      desk.setAttribute('data-booked', 'false');
      desk.setAttribute('href', 'manager-desk.png');
    });

    this.selectedDesk.emit(null);
    this.selectedBoardroom.emit(null);
    this.seatService.updateBookedSeats(0);
  }
}
