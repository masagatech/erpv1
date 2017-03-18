import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { purchaseadd } from './add/add.comp';
import { purchaseview } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NumTextModule } from '../../usercontrol/numtext';
import { LazyLoadEvent, DataTableModule, AutoCompleteModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class TaxMasterComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: TaxMasterComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: purchaseadd, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "pur", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: purchaseadd, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "pur", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: purchaseview, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "pur", "rights": "view", "urlname": "/purchase" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig),
        SharedComponentModule, FormsModule, CommonModule, NumTextModule, DataTableModule, AutoCompleteModule,CalendarModule],
    declarations: [
        purchaseadd,
        purchaseview,
        TaxMasterComp
    ],
    providers: [AuthGuard]
})

export default class TaxMasterModule {
}