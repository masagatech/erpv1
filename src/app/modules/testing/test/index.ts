import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { test } from './test.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class TestComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: TestComp,
        canActivate: [AuthGuard],
        data: { "module": "test" },
        children: [
            {
                path: '',
                children: [
                    {
                        path: '', component: test, canActivateChid: [AuthGuard],
                        data: { "module": "test", "submodule": "test", "rights": "view", "urlname": "" }
                    },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), FormsModule, CommonModule, AutoCompleteModule],
    declarations: [
        test,
        TestComp
    ],
    providers: [AuthGuard]
})

export default class TestModule {
}