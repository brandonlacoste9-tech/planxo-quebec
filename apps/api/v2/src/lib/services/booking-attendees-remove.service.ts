import { BookingAttendeesRemoveService as BaseBookingAttendeesRemoveService } from "@calcom/platform-libraries/bookings";
import { Injectable } from "@nestjs/common";
import { PrismaBookingAttendeeRepository } from "@/lib/repositories/prisma-booking-attendee.repository";

@Injectable()
export class BookingAttendeesRemoveService extends BaseBookingAttendeesRemoveService {
  constructor(bookingAttendeeRepository: PrismaBookingAttendeeRepository) {
    super({ bookingAttendeeRepository });
  }
}
