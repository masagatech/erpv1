import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { taxadd } from './add/add.comp';
import { taxview } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NumTextModule } from '../../usercontrol/numtext';
import { CalendarModule } from '../../usercontrol/calendar';
import { LazyLoadEvent, DataTableModule, AutoCompleteModule } from 'primeng/primeng';
import { AttributeModuleComp } from "../../usercontrol/attributemodule/attrmod.comp";

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
                    { path: 'add', component: taxadd, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "tm", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: taxadd, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "tm", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: taxview, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "tm", "rights": "view", "urlname": "/taxmaster" } },
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
        taxadd,
        taxview,
        TaxMasterComp,
        AttributeModuleComp,
    ],
    providers: [AuthGuard]
})

export default class TaxMasterModule {
}