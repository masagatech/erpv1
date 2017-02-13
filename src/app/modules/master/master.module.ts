import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MasterComp } from '../master/master.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { MasterDashboardComp } from '../master/dashboard/dashboard.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const routerConfig = [
  {
    path: '',
    component: MasterComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: 'acgroup', loadChildren: () => System.import('./acgroup').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'customer', loadChildren: () => System.import('./customer').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'vendor', loadChildren: () => System.import('./vendor').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'expensecontrolcentermap', loadChildren: () => System.import('./expensecontrolcentermap').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'expensevoucher', loadChildren: () => System.import('./expensevoucher').then((comp: any) => {
              return comp.default;
            }),
          },
          
          {
            path: 'transpoter', loadChildren: () => System.import('./transpoter').then((comp: any) => {
              return comp.default;
            }),
          },

          { path: '', component: MasterDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
  declarations: [
    MasterComp,
    MasterDashboardComp,
  ],

  providers: [AuthGuard]
})

export default class MasterModule {
}