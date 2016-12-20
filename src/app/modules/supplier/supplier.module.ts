import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SupplierComp } from '../supplier/supplier.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { SupplierDashboardComp } from '../supplier/dashboard/dashboard.comp';

import { purchaseadd } from '../supplier/purchase/add/purchaseadd.comp';                //Purchase Add
import { purchaseview } from '../supplier/purchase/view/purchaseview.comp';             //Purchase View

import { billadd } from '../supplier/bill/add/billadd.comp';                            //Bill Add
import { billview } from '../supplier/bill/view/billview.comp';                         //Bill View

import { payadd } from '../supplier/payment/add/payadd.comp';                            //Payment Add
import { payview } from '../supplier/payment/view/payview.comp';                         //Payment View

import { expadd } from '../supplier/exp/add/expadd.comp';                            //Exp Add
import { expview } from '../supplier/exp/view/expview.comp';                         //Exp View

import { itemadd } from '../supplier/itemsmaster/add/itemadd.comp';                            //item Add
import { itemview } from '../supplier/itemsmaster/view/itemview.comp';                         //item View

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
          //Suppler Purchase Add Edit And View
          { path: 'purchaseadd', component: purchaseadd, canActivateChid: [AuthGuard], },
          { path: 'purchaseedit/:id', component: purchaseadd, canActivateChid: [AuthGuard], },
          { path: 'purchaseview', component: purchaseview, canActivateChid: [AuthGuard], },

          //Suppler Bill Add Edit And View
          { path: 'billadd', component: billadd, canActivateChid: [AuthGuard], },
          { path: 'billedit/:id', component: billadd, canActivateChid: [AuthGuard], },
          { path: 'billview', component: billview, canActivateChid: [AuthGuard], },

           //Suppler Payment Add Edit And View
          { path: 'payadd', component: payadd, canActivateChid: [AuthGuard], },
          { path: 'payedit/:id', component: payadd, canActivateChid: [AuthGuard], },
          { path: 'payview', component: payview, canActivateChid: [AuthGuard], },

          //Supplier Item Master
          { path: 'itemadd', component: itemadd, canActivateChid: [AuthGuard], },
          { path: 'itemedit/:id', component: itemadd, canActivateChid: [AuthGuard], },
          { path: 'itemview', component: itemview, canActivateChid: [AuthGuard], },

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

     //Supplier Purchase 
     purchaseadd,
     purchaseview,

    //Supplier Bill 
     billadd,
     billview,

    //Supplier Payment 
    payadd,
    payview,

    //Supplier Items Master
    itemadd,
    itemview,
    
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