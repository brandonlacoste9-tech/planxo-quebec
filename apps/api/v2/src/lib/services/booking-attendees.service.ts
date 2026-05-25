import { BookingAttendeesService as BaseBookingAttendeesService } from "@calcom/platform-libraries/bookings";
import { Injectable } from "@nestjs/common";
import { BookingAttendeesRemoveService } from "./booking-attendees-remove.service";
import { PrismaBookingRepository } from "@/lib/repositories/prisma-booking.repository";

@Injectable()
export class BookingAttendeesService extends BaseBookingAttendeesService {
  constructor(
    bookingRepository: PrismaBookingRepository,
    bookingAttendeesRemoveService: BookingAttendeesRemoveService
  ) {
    super({ bookingRepository, bookingAttendeesRemoveService });
  }
}
