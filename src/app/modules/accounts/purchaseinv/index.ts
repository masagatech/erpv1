import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { purchaseInvadd } from './add/add.comp';
import { purchaseinvview } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NumTextModule } from '../../usercontrol/numtext';
import { LazyLoadEvent, DataTableModule, AutoCompleteModule,SplitButtonModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class PurchaseInvComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: PurchaseInvComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: purchaseInvadd, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "purinv", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: purchaseInvadd, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "purinv", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: purchaseinvview, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "purinv", "rights": "view", "urlname": "/purchaseinv" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig),
        SharedComponentModule, FormsModule, CommonModule, NumTextModule, DataTableModule,
        AutoCompleteModule, CalendarModule,SplitButtonModule],
    declarations: [
        purchaseInvadd,
        purchaseinvview,
        PurchaseInvComp
    ],
    providers: [AuthGuard]
})

export default class PurchaseInvModule {
}