import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { bankpaymentaddedit } from './aded/bpae.comp';     //Bank Payment
import { bankpaymentview } from './view/bpview.comp';      //Bank Bayment View

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class BankPaymentComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BankPaymentComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    //Bank Payment Add Edit View
                    
                    { path: 'add', component: bankpaymentaddedit, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: bankpaymentaddedit, canActivateChid: [AuthGuard], },
                    { path: '', component: bankpaymentview, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        bankpaymentaddedit,
        bankpaymentview,
        BankPaymentComp
    ],
    providers: [AuthGuard]
})

export default class BankPaymentModule {
}