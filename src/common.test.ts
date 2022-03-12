// CustomEvent polyfill for Node.js
globalThis.CustomEvent ??= class CustomEvent<T = any> extends Event {
    readonly detail: T;

    constructor(type: string, eventInitDict?: CustomEventInit) {
        super(type, eventInitDict);
        this.detail = eventInitDict?.detail;
    }

    /** @deprecated */
    initCustomEvent(type: string, bubbles?: boolean, cancelable?: boolean, detail?: T): void {
    }
};
