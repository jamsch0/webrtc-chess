// Polyfills/stubs for running tests in Node.js

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

globalThis.localStorage ??= new class implements Storage {
    #data: Map<string, string> = new Map();

    get length(): number {
        return this.#data.values.length;
    }

    clear(): void {
        this.#data.clear();
    }

    getItem(key: string): string | null {
        return this.#data.get(key) ?? null;
    }

    key(index: number): string | null {
        return Array.from(this.#data.keys())[index] ?? null;
    }

    removeItem(key: string): void {
        this.#data.delete(key);
    }

    setItem(key: string, value: string): void {
        this.#data.set(key, value);
    }
};
