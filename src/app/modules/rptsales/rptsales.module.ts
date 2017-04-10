import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_service/authguard-service';
import { ReportSalesComp } from '../rptsales/rptsales.comp';
import { ReportSalesDashboardComp } from '../rptsales/dashboard/dashboard.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ScheduleModule } from 'primeng/primeng';

const routerConfig = [
  {
    path: '',
    component: ReportSalesComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: 'salesview', loadChildren: () => System.import('./salesview').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'salesanalysis', loadChildren: () => System.import('./salesanalysis').then((comp: any) => {
              return comp.default;
            }),
          },
          
          { path: '', component: ReportSalesDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, ScheduleModule],
  declarations: [
    ReportSalesComp,
    ReportSalesDashboardComp,
  ],
  providers: [AuthGuard]
})

export default class SettingModule {
}