import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingComp } from '../setting/setting.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SettingDashboardComp } from '../setting/dashboard/dashboard.comp';
import { ALSAddEdit } from '../setting/auditlocksetting/addals.comp';
import { CompanyAddEdit } from '../setting/company/aded/addcompany.comp';
import { ViewCompany } from '../setting/company/view/viewcompany.comp';
import { AddUser } from '../setting/usermaster/aded/adduser.comp';
import { ViewUser } from '../setting/usermaster/view/viewuser.comp';
import { AddUserRights } from '../setting/userrights/aded/addur.comp';
import { ViewUserRights } from '../setting/userrights/view/viewur.comp';
import { AddFY } from '../setting/fy/aded/addfy.comp';
import { ViewFY } from '../setting/fy/view/viewfy.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../_shared/shared.module'
import { GroupByPipe } from '../../_pipe/groupby.pipe'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DataTableModule, DataListModule, CheckboxModule, DataGridModule, PanelModule, DialogModule } from 'primeng/primeng';

const routerConfig = [
  {
    path: '',
    component: SettingComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          { path: 'auditlocksetting', component: ALSAddEdit, canActivateChid: [AuthGuard], },
          { path: 'addcompany', component: CompanyAddEdit, canActivateChid: [AuthGuard], },
          { path: 'editcompany/:cmpid', component: CompanyAddEdit, canActivateChid: [AuthGuard], },
          { path: 'company', component: ViewCompany, canActivateChid: [AuthGuard], },
          { path: 'adduser', component: AddUser, canActivateChid: [AuthGuard], },
          { path: 'edituser/:uid', component: AddUser, canActivateChid: [AuthGuard], },
          { path: 'usermaster', component: ViewUser, canActivateChid: [AuthGuard], },
          { path: 'viewuserrights', component: ViewUserRights, canActivateChid: [AuthGuard], },
          { path: 'addfinancialyear', component: AddFY, canActivateChid: [AuthGuard], },
          { path: 'editfinancialyear/:fyid', component: AddFY, canActivateChid: [AuthGuard], },
          { path: 'financialyear', component: ViewFY, canActivateChid: [AuthGuard], },
          { path: 'adduserrights', component: AddUserRights, canActivateChid: [AuthGuard], },
          { path: 'edituserrights/:uid', component: AddUserRights, canActivateChid: [AuthGuard], },
          { path: '', component: SettingDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
    DataTableModule, DataListModule, CheckboxModule, DataGridModule, PanelModule, DialogModule],
  declarations: [
    CompanyAddEdit,
    ViewCompany,
    ALSAddEdit,
    AddUser,
    ViewUser,
    AddUserRights,
    ViewUserRights,
    AddFY,
    ViewFY,
    SettingComp,
    SettingDashboardComp,
    GroupByPipe
  ],
  providers: [AuthGuard]
})

export default class SettingModule {
}