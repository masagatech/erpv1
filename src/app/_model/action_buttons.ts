export class ActionBtnProp {
    constructor(_id: string,
        _text: string,
        _icon: string,
        _enabled: boolean,
        _hide: boolean,
        _ddloptions?: any
    ) {
        this.id = _id;
        this.text = _text;
        this.icon = _icon;
        this.enabled = _enabled;
        this.hide = _hide;
        this.ddloptions = _ddloptions;
    }
    id: string
    text: string
    icon: string
    enabled: boolean
    hide: boolean
    ddloptions: any
}



export class Details {
    constructor(_type: string,
        _details: any) {
        this.type = _type;
        this.details = _details;
    }
    type: string
    details: any
}

export class Evt {
    constructor(_evt: string,
        _$event: any) {
        this.evt = _evt;
        this.$event = _$event;
    }
    evt: string
    $event: any
}
