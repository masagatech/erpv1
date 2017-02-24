import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_service/authguard-service';
import { TestingComp } from './testing.comp';
//import { ALSAddEdit } from '../setting/auditlocksetting/addals.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



const routerConfig = [
  {
    path: '',
    component: TestingComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          //{ path: 'auditlocksetting', component: ALSAddEdit, canActivateChid: [AuthGuard], },

          {
            path: '', loadChildren: () => System.import('./test').then((comp: any) => {
              return comp.default;
            }),
          }
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule],
  declarations: [
    //ALSAddEdit,
    TestingComp
  ],
  providers: [AuthGuard]
})

export default class SettingModule {
}