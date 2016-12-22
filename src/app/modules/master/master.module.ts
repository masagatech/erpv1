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
            
          //Ac Group Add And View 
           {
            path: 'acgroup', loadChildren: () => System.import('./acgroup').then((comp: any) => {
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
    //Common Module
     MasterComp,
     MasterDashboardComp,
     //Ac Group Add And View 
  ],
  providers: [AuthGuard]
})

export default class MasterModule {
}