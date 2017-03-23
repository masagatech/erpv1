import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { disadd } from './add/add.comp';
import { disview } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NumTextModule } from '../../usercontrol/numtext';
import { CalendarModule } from '../../usercontrol/calendar';
import { LazyLoadEvent, DataTableModule, AutoCompleteModule } from 'primeng/primeng';

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
        data: { "module": "coa" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: disadd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "dm", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: disadd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "dm", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: disview, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "dm", "rights": "view", "urlname": "/itemdiscount" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig),
        SharedComponentModule, FormsModule, CommonModule, NumTextModule, DataTableModule,
        AutoCompleteModule,CalendarModule],
    declarations: [
        disadd,
        disview,
        TaxMasterComp
    ],
    providers: [AuthGuard]
})

export default class TaxMasterModule {
}