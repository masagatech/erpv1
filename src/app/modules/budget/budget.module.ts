import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BudgetComp } from '../budget/budget.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { BudgetDashboardComp } from '../budget/dashboard/dashboard.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const routerConfig = [
  {
    path: '',
    component: BudgetComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: 'initiate', loadChildren: () => System.import('./initiate').then((comp: any) => {
              return comp.default;
            }),
          },
          {
            path: 'committee', loadChildren: () => System.import('./committee').then((comp: any) => {
              return comp.default;
            }),
          },
          {
            path: 'envelope', loadChildren: () => System.import('./envelope').then((comp: any) => {
              return comp.default;
            }),
          },
          {
            path: 'startforecasting', loadChildren: () => System.import('./expensebudget').then((comp: any) => {
              return comp.default;
            }),
          },
          
          { path: '', component: BudgetDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
  declarations: [
    BudgetComp,
    BudgetDashboardComp,
  ],

  providers: [AuthGuard]
})

export default class BudgetModule {
}