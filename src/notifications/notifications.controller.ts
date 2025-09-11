import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../types/request-with-user';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

 @Get()
@ApiOperation({ summary: 'Get notifications for the logged-in user' })
getUserNotifications(
  @Req() req: RequestWithUser,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  return this.notificationsService.getUserNotifications(
    req.user.id,
    Number(page),
    Number(limit),
  );
}

@Get('unread')
@ApiOperation({ summary: 'Get unread notifications for the logged-in user' })
getUnreadNotifications(
  @Req() req: RequestWithUser,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  return this.notificationsService.getUnreadNotifications(
    req.user.id,
    Number(page),
    Number(limit),
  );
}


  // Missing: Get unread count
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count for the logged-in user' })
  getUnreadCount(@Req() req: RequestWithUser) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  // Missing: Mark all as read
  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read for the logged-in user' })
  markAllAsRead(@Req() req: RequestWithUser) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

 

  //Already existing
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', type: 'string', description: 'Notification ID' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // Already existing
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', type: 'string', description: 'Notification ID' })
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }

  // Missing: Send to a single user (admin action)
  @Post('send-to-user/:userId')
  @ApiOperation({ summary: 'Send a notification to a specific user (Admin only)' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        body: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
        type: { type: 'string' },
      },
    },
  })
  sendToUser(
    @Param('userId') userId: string,
    @Body() body: { title: string; body: string; data?: Record<string, any>; type?: string },
  ) {
    return this.notificationsService.sendToUser(userId, body.title, body.body, body.data, body.type);
  }

  // Missing: Send to multiple users (admin action)
  @Post('send-to-users')
  @ApiOperation({ summary: 'Send a notification to multiple users (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userIds: { type: 'array', items: { type: 'string' } },
        title: { type: 'string' },
        body: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
        type: { type: 'string' },
      },
    },
  })
  sendToUsers(
    @Body() body: { userIds: string[]; title: string; body: string; data?: Record<string, any>; type?: string },
  ) {
    return this.notificationsService.sendNotification(body.userIds, body.title, body.body, body.data, body.type);
  }

  // Missing: Broadcast to all users (admin action)
  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast a notification to all users (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        body: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
        type: { type: 'string' },
      },
    },
  })
  broadcast(
    @Body() body: { title: string; body: string; data?: Record<string, any>; type?: string },
  ) {
    return this.notificationsService.broadcastNotification(body.title, body.body, body.data, body.type);
  }
}
