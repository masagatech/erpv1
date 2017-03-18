import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { generateInv } from '../generateinvoice/generateinv.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from '../../usercontrol/calendar';

import { LazyLoadEvent, DataTableModule, AutoCompleteModule, SplitButtonModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class generateInvComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: generateInvComp,
        canActivate: [AuthGuard],
        data: { "module": "dcm" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: generateInv, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "ginv", "rights": "view", "urlname": "generateinv" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
        FormsModule, CommonModule, CalendarModule, DataTableModule, AutoCompleteModule, NumTextModule, SplitButtonModule],
    declarations: [
        generateInv,
        generateInvComp
    ],
    providers: [AuthGuard]
})

export default class GenerateinvModule {
}