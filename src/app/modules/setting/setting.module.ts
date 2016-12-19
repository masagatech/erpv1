import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingComp } from '../setting/setting.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SettingDashboardComp } from '../setting/dashboard/dashboard.comp';
import { ALSAddEdit } from '../setting/auditlocksetting/addals.comp';
import { CompanyAddEdit } from '../setting/company/aded/addcompany.comp';
import { ViewCompany } from '../setting/company/view/viewcompany.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../_shared/shared.module'
import { GroupByPipe } from '../../_pipe/groupby.pipe'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  DataTableModule, DataListModule, CheckboxModule, DataGridModule, PanelModule, DialogModule,
  FileUploadModule, GrowlModule, MessagesModule
} from 'primeng/primeng';

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

          {
            path: 'fy', loadChildren: () => System.import('./fy').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'usermaster', loadChildren: () => System.import('./usermaster').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'userrights', loadChildren: () => System.import('./userrights').then((comp: any) => {
              return comp.default;
            }),
          },

          { path: '', component: SettingDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
    DataTableModule, DataListModule, CheckboxModule, DataGridModule, PanelModule, DialogModule,
    FileUploadModule, GrowlModule, MessagesModule],
  declarations: [
    CompanyAddEdit,
    ViewCompany,
    ALSAddEdit,
    SettingComp,
    SettingDashboardComp,
    GroupByPipe
  ],
  providers: [AuthGuard]
})

export default class SettingModule {
}