import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TransactionComp } from '../transaction/transaction.comp';
import { AuthGuard } from '../../_service/authguard-service';

import { TransactionDashboardComp } from './dashboard/dashboard.comp';

import { dcADDEdit } from './dcmaster/add/aded.comp';
import { dcview } from './dcmaster/view/adedview.comp';                      //Dc Master View`
import { SharedComponentModule } from '../../_shared/sharedcomp.module';

import { generateInv } from '../transaction/generateinvoice/generateinv.comp';      //Generate Invoice
import { pendingdc } from '../transaction/pendingDC/pendingdc.comp';                //Pending DC

import { FormsModule }          from '@angular/forms';
import {CommonModule} from '@angular/common'

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
             { path: 'aded', component: dcADDEdit, canActivateChid: [AuthGuard], },
            { path: 'adedview', component: dcview, canActivateChid: [AuthGuard], },
            { path: 'adededit/:id', component: dcADDEdit, canActivateChid: [AuthGuard], },
            //Pending Dc
            { path: 'pendingdc', component: pendingdc, canActivateChid: [AuthGuard], },
            //Generate Invoice
            { path: 'generateinv', component: generateInv, canActivateChid: [AuthGuard], },
            { path: '', component: TransactionDashboardComp, canActivateChid: [AuthGuard], },
          ]
        }
      ]
    }
  ]




@NgModule({
  imports: [RouterModule.forChild(routerConfig), SharedComponentModule,FormsModule, CommonModule],
  declarations: [
    dcADDEdit,
    dcview,
     //Pending Dc
    pendingdc,
    //Generate Invoice
    generateInv,
    TransactionComp,
    TransactionDashboardComp
  ],
  providers: [AuthGuard]
})
export default class TransactionModule {
}