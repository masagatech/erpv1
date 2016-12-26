import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { bankreceiptaddedit } from './aded/braded.comp';     //Bank Payment
import { bankreceiptview } from './view/brview.comp';      //Bank Bayment View

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class BankReceiptComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BankReceiptComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    //Bank Payment Add Edit View

                    { path: 'add', component: bankreceiptaddedit, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: bankreceiptaddedit, canActivateChid: [AuthGuard], },
                    { path: '', component: bankreceiptview, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        bankreceiptaddedit,
        bankreceiptview,
        BankReceiptComp
    ],
    providers: [AuthGuard]
})

export default class BankReceiptModule {
}