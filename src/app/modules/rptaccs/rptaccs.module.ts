import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_service/authguard-service';
import { ReportAccountsComp } from '../rptaccs/rptaccs.comp';
import { ReportAccountsDashboardComp } from '../rptaccs/dashboard/dashboard.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ScheduleModule } from 'primeng/primeng';

const routerConfig = [
  {
    path: '',
    component: ReportAccountsComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: 'bankview', loadChildren: () => System.import('./bankview').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'bankbook', loadChildren: () => System.import('./bankbook').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'bankdashboard', loadChildren: () => System.import('./bankdashboard').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'ledger', loadChildren: () => System.import('./ledger').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'profitnloss', loadChildren: () => System.import('./profitnloss').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'balancesheet', loadChildren: () => System.import('./balancesheet').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'trialbalance', loadChildren: () => System.import('./trialbalance').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'debtors', loadChildren: () => System.import('./debtors').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'jv', loadChildren: () => System.import('./jv').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'pdc', loadChildren: () => System.import('./pdc').then((comp: any) => {
              return comp.default;
            }),
          },
          
          { path: '', component: ReportAccountsDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, ScheduleModule],
  declarations: [
    ReportAccountsComp,
    ReportAccountsDashboardComp,
  ],
  providers: [AuthGuard]
})

export default class SettingModule {
}