import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeComp } from '../employee/employee.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { EmployeeDashboardComp } from '../employee/dashboard/dashboard.comp';
import { EmployeeAddEdit } from '../employee/aded/addemployee.comp';
import { ViewEmployee } from '../employee/view/viewemployee.comp';
import { ActionBarModule } from '../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';

const routerConfig = [
  {
    path: '',
    component: EmployeeComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          { path: 'viewemployee', component: ViewEmployee, canActivateChid: [AuthGuard], },
          { path: 'addemployee', component: EmployeeAddEdit, canActivateChid: [AuthGuard], },
          { path: 'editemployee/:UserID', component: EmployeeAddEdit, canActivateChid: [AuthGuard], },
          { path: '', component: EmployeeDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule],
  declarations: [
    ViewEmployee,
    EmployeeAddEdit,
    
    EmployeeDashboardComp,
    EmployeeComp
  ],
  providers: [AuthGuard]
})

export default class EmployeeModule {
}