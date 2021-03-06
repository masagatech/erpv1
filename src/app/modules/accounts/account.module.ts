import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccountsComp } from '../accounts/account.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { AccountDashboardComp } from '../accounts/dashboard/dashboard.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const routerConfig = [
  {
    path: '',
    component: AccountsComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: 'jv', loadChildren: () => System.import('./jv').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'debitnote', loadChildren: () => System.import('./debitnote').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'creditnote', loadChildren: () => System.import('./creditnote').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'bankpayment', loadChildren: () => System.import('./bankpayment').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'bankreceipt', loadChildren: () => System.import('./bankreceipt').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'receiptbookissued', loadChildren: () => System.import('./issuerecptbk').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'pdc', loadChildren: () => System.import('./pdc').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'cashflow', loadChildren: () => System.import('./cashflow').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'bankreco', loadChildren: () => System.import('./bankreco').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'taxmaster', loadChildren: () => System.import('./taxmaster').then((comp: any) => {
              return comp.default;
            }),
          },

          { path: '', component: AccountDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
  declarations: [
    AccountsComp,
    AccountDashboardComp,
  ],
  providers: [AuthGuard]
})

export default class AccountModule {
}