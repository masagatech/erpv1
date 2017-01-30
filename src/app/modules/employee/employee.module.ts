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
    data: { "module": "emp" },
    children: [
      {
        path: '',
        children: [
          { path: 'view', component: ViewEmployee, canActivateChild: [AuthGuard], data: { "module": "emp", "submodule": "emp", "rights": "view", "urlname": "/view" } },
          { path: 'details/:empid', component: EmployeeAddEdit, canActivateChild: [AuthGuard], data: { "module": "emp", "submodule": "emp", "rights": "view", "urlname": "/details" } },
          { path: 'add', component: EmployeeAddEdit, canActivateChild: [AuthGuard], data: { "module": "emp", "submodule": "emp", "rights": "add", "urlname": "/add" } },
          { path: 'edit/:empid', component: EmployeeAddEdit, canActivateChild: [AuthGuard], data: { "module": "emp", "submodule": "emp", "rights": "edit", "urlname": "/edit" } },
          { path: '', redirectTo: 'view' },
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