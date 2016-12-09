import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccountsComp } from '../accounts/account.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { AccountDashboardComp } from '../accounts/dashboard/dashboard.comp';

import { JVAddEdit } from '../accounts/jv/aded/jv.comp';
import { ViewJV } from '../accounts/jv/view/jvview.comp';
import { DebitNoteAddEdit } from '../accounts/debitnote/aded/adddebitnote.comp';
import { ViewDebitNote } from '../accounts/debitnote/view/viewdebitnote.comp';

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
          { path: 'viewjv', component: ViewJV, canActivateChid: [AuthGuard], },
          { path: 'addjv', component: JVAddEdit, canActivateChid: [AuthGuard], },
          { path: 'editjv/:ID', component: JVAddEdit, canActivateChid: [AuthGuard], },

          { path: 'viewdebitnote', component: ViewDebitNote, canActivateChid: [AuthGuard], },
          { path: 'adddebitnote', component: DebitNoteAddEdit, canActivateChid: [AuthGuard], },
          { path: 'editdebitnote/:ID', component: DebitNoteAddEdit, canActivateChid: [AuthGuard], },

          { path: '', component: AccountDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
  declarations: [
    JVAddEdit,
    AccountsComp,
    AccountDashboardComp,
    ViewJV,
    JVAddEdit,
    ViewDebitNote,
    DebitNoteAddEdit,
  ],
  providers: [AuthGuard]
})

export default class AccountModule {
}