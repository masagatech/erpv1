import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { generatesample } from '../generatesample/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from '../../usercontrol/calendar';

import { LazyLoadEvent, DataTableModule, AutoCompleteModule, SplitButtonModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

// import { _currencyPipe } from '../../../_pipe/currency.pipe';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class GenerateSampleComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: GenerateSampleComp,
        canActivate: [AuthGuard],
        data: { "module": "dcm" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: generatesample, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "invords", "rights": "view", "urlname": "invordsample" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
        FormsModule, CommonModule, CalendarModule, DataTableModule, AutoCompleteModule, NumTextModule, SplitButtonModule],
    declarations: [
        generatesample,
        GenerateSampleComp,
        //_currencyPipe
    ],
    providers: [AuthGuard]
})

export default class GenerateSampleModule {
}