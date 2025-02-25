import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SeatService } from '../seat.service';

@Component({
  selector: 'app-desk-map',
  templateUrl: './desk-map.component.html',
  styleUrls: ['./desk-map.component.css']
})
export class DeskMapComponent implements AfterViewInit{
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef;
  bookedSeats: Set<string> = new Set(); // Store booked seats
  imageState: { [key: string]: string } = {}; // 
  draggingElement: SVGImageElement | null = null;
  offsetX: number = 0;
  offsetY: number = 0;
  
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

        if (this.bookedSeats.has(seatId)) {
          this.bookedSeats.delete(seatId);
          seat.setAttribute("fill", "white"); // Unbook seat
        } else {
          this.bookedSeats.add(seatId);
          seat.setAttribute("fill", "red"); // Book seat
        }

        // Update booked seat count in SeatService
        this.seatService.updateBookedSeats(this.bookedSeats.size);
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
      image.setAttribute('href', 'empty-desk.png'); // Change to empty desk
    } else if (currentSrc === 'empty-desk.png') {
      image.setAttribute('href', 'desk.png'); // Change back to desk
    } else if (currentSrc === 'filled.png') {
      image.setAttribute('href', 'unfilled.png'); // Change to unfilled desk
    } else if (currentSrc === 'unfilled.png') {
      image.setAttribute('href', 'filled.png'); // Change back to filled desk
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

    /// Convert mouse coordinates to SVG coordinates
    const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
    const imageX = parseFloat(image.getAttribute('x') || '0');
    const imageY = parseFloat(image.getAttribute('y') || '0');

    // Calculate offset within the SVG coordinate system
    this.offsetX = event.clientX - svgRect.left - imageX;
    this.offsetY = event.clientY - svgRect.top - imageY;
  }

  drag(event: MouseEvent) {
    if (this.draggingElement) {
      const gridSize = 80; // Adjust grid size as needed
      const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
      let newX = event.clientX - svgRect.left - this.offsetX;
      let newY = event.clientY - svgRect.top - this.offsetY;
  
      // Snap to nearest grid point
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
  
      this.draggingElement.setAttribute('x', `${newX}`);
      this.draggingElement.setAttribute('y', `${newY}`);
    }
  }

  endDrag() {
    this.draggingElement = null;
  }

  /** ✅ Reset all bookings and images  (Wrong Working) */
  resetBookings() {
    this.bookedSeats.clear(); // Clear all booked seats

    // Reset all seats to white (available)
    const seats = this.svgContainer.nativeElement.querySelectorAll('.desk');
    seats.forEach((seat: SVGElement) => {
      seat.setAttribute('fill', 'white');
    });

    // Reset all images to their original state
    const images = this.svgContainer.nativeElement.querySelectorAll('image');
    images.forEach((image: SVGImageElement) => {
      const id = image.getAttribute('id');
      if (id && this.imageState[id]) {
        delete this.imageState[id]; // Remove the modified state
        if (image.getAttribute('href')?.includes('empty')) {
          image.setAttribute('href', 'desk.png'); // Reset empty desks
        } else if (image.getAttribute('href')?.includes('unfilled')) {
          image.setAttribute('href', 'filled.png'); // Reset filled desks
        }
      }
    });
  }
}
