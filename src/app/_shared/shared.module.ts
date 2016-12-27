import { NgModule, ModuleWithProviders } from "@angular/core";
import { AuthenticationService } from "../_service/auth-service";
import { UserService } from "../_service/user/user-service"
import { AuthGuard } from "../_service/authguard-service"
import { DataService } from '../_service/dataconnect'

@NgModule({})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [AuthenticationService, UserService, AuthGuard, DataService]
        };
    }
}

import { SharedVariableService } from "../_service/sharedvariable-service";

@NgModule({})

export class ActionBarModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ActionBarModule,
            providers: [SharedVariableService]
        };
    }
}

import { MessageService } from "../_service/messages/message-service";
import { ConfirmationService } from 'primeng/primeng';

@NgModule({})
export class GlobalShared {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: GlobalShared,
            providers: [MessageService, ConfirmationService]
        };
    }
}