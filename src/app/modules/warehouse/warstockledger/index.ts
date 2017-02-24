import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { WhStockLed } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from '../../usercontrol/calendar';

import { LazyLoadEvent, DataTableModule,DataListModule,CheckboxModule } from 'primeng/primeng';


@Component({
    template: '<router-outlet></router-outlet>'
})
export class WhStockComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: WhStockComp,
        canActivate: [AuthGuard],
        data: { "module": "waresub" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: WhStockLed, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "sl", "rights": "view", "urlname": "/stckledger" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
    FormsModule, CommonModule,DataListModule,DataTableModule, CheckboxModule,CalendarModule],
    declarations: [
        WhStockLed,
        WhStockComp
    ],
    providers: [AuthGuard]
})

export default class WhStockModule {
}