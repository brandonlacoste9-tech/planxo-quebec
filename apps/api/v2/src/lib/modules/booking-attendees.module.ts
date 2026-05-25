import { Module } from "@nestjs/common";
import { PrismaBookingRepository } from "@/lib/repositories/prisma-booking.repository";
import { PrismaBookingAttendeeRepository } from "@/lib/repositories/prisma-booking-attendee.repository";
import { BookingAttendeesService } from "@/lib/services/booking-attendees.service";
import { BookingAttendeesRemoveService } from "@/lib/services/booking-attendees-remove.service";
import { PrismaModule } from "@/modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaBookingRepository,
    PrismaBookingAttendeeRepository,
    BookingAttendeesRemoveService,
    BookingAttendeesService,
  ],
  exports: [BookingAttendeesService],
})
export class BookingAttendeesModule {}
