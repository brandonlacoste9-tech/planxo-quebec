import { NoSlotsNotificationService as BaseNoSlotsNotificationService } from "@calcom/platform-libraries/slots";
import { Injectable } from "@nestjs/common";
import { PrismaMembershipRepository } from "@/lib/repositories/prisma-membership.repository";
import { RedisService } from "@/modules/redis/redis.service";

@Injectable()
export class NoSlotsNotificationService extends BaseNoSlotsNotificationService {
  constructor(membershipRepository: PrismaMembershipRepository, redisService: RedisService) {
    super({
      membershipRepo: membershipRepository,
      redisClient: redisService,
    });
  }
}
