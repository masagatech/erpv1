import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SupplierComp } from '../supplier/supplier.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { SupplierDashboardComp } from '../supplier/dashboard/dashboard.comp';

import { billadd } from '../supplier/bill/add/billadd.comp';                            //Bill Add
import { billview } from '../supplier/bill/view/billview.comp';                         //Bill View

import { payadd } from '../supplier/payment/add/payadd.comp';                            //Payment Add
import { payview } from '../supplier/payment/view/payview.comp';                         //Payment View

import { expadd } from '../supplier/exp/add/expadd.comp';                            //Exp Add
import { expview } from '../supplier/exp/view/expview.comp';                         //Exp View


import { supplierdetailsview } from '../supplier/supplierdetails/supplierdetails.comp';                         //Exp View


import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const routerConfig = [
  {
    path: '',
    component: SupplierComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          //Suppler Bill Add Edit And View
          { path: 'billadd', component: billadd, canActivateChid: [AuthGuard], },
          { path: 'billedit/:id', component: billadd, canActivateChid: [AuthGuard], },
          { path: 'billview', component: billview, canActivateChid: [AuthGuard], },

          //Suppler Payment Add Edit And View
          { path: 'payadd', component: payadd, canActivateChid: [AuthGuard], },
          { path: 'payedit/:id', component: payadd, canActivateChid: [AuthGuard], },
          { path: 'payview', component: payview, canActivateChid: [AuthGuard], },

          {
            path: 'material', loadChildren: () => System.import('./materialmaster').then((comp: any) => {
              return comp.default;
            }),
          },

          {
            path: 'itemsmaster', loadChildren: () => System.import('./itemsmaster').then((comp: any) => {
              return comp.default;
            }),
          },
          {
            path: 'itemgroup', loadChildren: () => System.import('./itemgroup').then((comp: any) => {
              return comp.default;
            }),
          },

          //Suppler Expenses Add Edit And View
          { path: 'expadd', component: expadd, canActivateChid: [AuthGuard], },
          { path: 'expedit/:id', component: expadd, canActivateChid: [AuthGuard], },
          { path: 'expview', component: expview, canActivateChid: [AuthGuard], },

          //Supplier Details View
          { path: 'suppdet/:id', component: supplierdetailsview, canActivateChid: [AuthGuard], },

          { path: '', component: SupplierDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
  declarations: [
    //Common Module
    SupplierComp,
    SupplierDashboardComp,

    //Supplier Bill 
    billadd,
    billview,

    //Supplier Payment 
    payadd,
    payview,

    //Supplier Items Master
    // itemadd,
    // itemview,

    //Supplier Details
    supplierdetailsview,

    //Supplier Expenses 
    expadd,
    expview,

  ],
  providers: [AuthGuard]
})

export default class SupplierModule {
}