import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_service/authguard-service';
import { ReportsComp } from '../reports/reports.comp';
import { ReportsDashboardComp } from '../reports/dashboard/dashboard.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ScheduleModule } from 'primeng/primeng';

const routerConfig = [
  {
    path: '',
    component: ReportsComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: 'bankview', loadChildren: () => System.import('./apar').then((comp: any) => {
              return comp.default;
            }),
          },
          
          { path: '', component: ReportsDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, ScheduleModule],
  declarations: [
    ReportsComp,
    ReportsDashboardComp
  ],
  providers: [AuthGuard]
})

export default class SettingModule {
}