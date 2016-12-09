import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TransactionComp } from '../transaction/transaction.comp';
import { AuthGuard } from '../../_service/authguard-service';

import { TransactionDashboardComp } from '../transaction/dashboard/dashboard.comp';
import { dcADDEdit } from '../transaction/dcmaster/aded.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';

import { FormsModule }          from '@angular/forms';
import {CommonModule} from '@angular/common'

//import { AccountEntryComp } from '../accounts/entry/entry.comp';

//import { ActionBarModule } from '../../_shared/shared.module'
//import { HotkeyModule } from 'angular2-hotkeys';

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
            // { path: 'entry', component: AccountEntryComp, canActivateChid: [AuthGuard], },
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
    TransactionComp,
    TransactionDashboardComp
  ],
  providers: [AuthGuard]
})
export default class TransactionModule {
}