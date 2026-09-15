import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlertsService } from './alerts.service';

@Controller('alerts')
@UseGuards(AuthGuard('jwt'))
export class AlertsController {
  constructor(private alerts: AlertsService) {}

  @Get()
  list(@Req() req: any) {
    return this.alerts.findForUser(req.user.userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.alerts.markRead(id);
  }
}
