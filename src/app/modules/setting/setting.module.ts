import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingComp } from '../setting/setting.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SettingDashboardComp } from '../setting/dashboard/dashboard.comp';
import { ALSAddEdit } from '../setting/auditlocksetting/addals.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DataListModule, DataGridModule, PanelModule, FileUploadModule } from 'primeng/primeng';

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

          // {
          //   path: 'auditlocksetting', loadChildren: () => System.import('./auditlocksetting').then((comp: any) => {
          //     return comp.default;
          //   }),
          // },

          {
            path: 'company', loadChildren: () => System.import('./company').then((comp: any) => {
              return comp.default;
            }),
          },

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

          {
            path: 'masterofmaster', loadChildren: () => System.import('./mom').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'attribute', loadChildren: () => System.import('./attribute').then((comp: any) => {
              return comp.default;
            }),
          },
          {
            path: 'hierar', loadChildren: () => System.import('./hierarchical').then((comp: any) => {
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
    DataListModule, DataGridModule, PanelModule, FileUploadModule],
  declarations: [
    ALSAddEdit,
    SettingComp,
    SettingDashboardComp
  ],
  providers: [AuthGuard]
})

export default class SettingModule {
}