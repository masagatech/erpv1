import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { generateInv } from '../generateinvoice/generateinv.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from '../../usercontrol/calendar';

import { LazyLoadEvent, DataTableModule, AutoCompleteModule } from 'primeng/primeng';

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
        children: [
            {
                path: '',
                children: [
                    { path: 'generateinv', component: generateInv, canActivateChid: [AuthGuard], },
                    { path: '', component: generateInv, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
    FormsModule, CommonModule, CalendarModule, DataTableModule, AutoCompleteModule,],
    declarations: [
        generateInv,
        generateInvComp
    ],
    providers: [AuthGuard]
})

export default class GenerateinvModule {
}