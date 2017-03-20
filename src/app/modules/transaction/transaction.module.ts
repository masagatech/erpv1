import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TransactionComp } from '../transaction/transaction.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { TransactionDashboardComp } from './dashboard/dashboard.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';



import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'

const routerConfig =
  [
    {
      path: '',
      component: TransactionComp,
      canActivate: [AuthGuard],
      children: [
        {
          path: '',
          children: [
            {
              path: 'dcmaster', loadChildren: () => System.import('./dcmaster').then((comp: any) => {
                return comp.default;
              }),
            },
            {
              path: 'generateinv', loadChildren: () => System.import('./generateinvoice').then((comp: any) => {
                return comp.default;
              }),
            },
            {
              path: 'pendingdc', loadChildren: () => System.import('./pendingDC').then((comp: any) => {
                return comp.default;
              }),
            },
            {
              path: 'salesordsample', loadChildren: () => System.import('./salesordsample').then((comp: any) => {
                return comp.default;
              }),
            },
            {
              path: 'penordsample', loadChildren: () => System.import('./pendingsalessimple').then((comp: any) => {
                return comp.default;
              }),
            },
            {
              path: 'invordsample', loadChildren: () => System.import('./generatesample').then((comp: any) => {
                return comp.default;
              }),
            },
            { path: '', component: TransactionDashboardComp, canActivateChid: [AuthGuard], },
          ]
        }
      ]
    }
  ]




@NgModule({
  imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
  declarations: [
    TransactionComp,
    TransactionDashboardComp
  ],
  providers: [AuthGuard]
})
export default class TransactionModule {
}