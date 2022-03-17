declare global {
    interface DispatcherEventMap {
    }
}

type EventListener<T extends keyof DispatcherEventMap> = (event: CustomEvent<DispatcherEventMap[T]>) => void;

type EventListenerObject<T extends keyof DispatcherEventMap> = {
    [K in T as `on${Capitalize<K>}`]: (event: CustomEvent<DispatcherEventMap[T]>) => void;
};

interface Dispatcher {
    addEventListener<T extends keyof DispatcherEventMap>(
        type: T,
        callback: EventListener<T> | EventListenerObject<T>,
        options?: AddEventListenerOptions | boolean,
    ): void;

    removeEventListener<T extends keyof DispatcherEventMap>(
        type: T,
        callback: EventListener<T> | EventListenerObject<T>,
        options?: EventListenerOptions | boolean,
    ): void;

    dispatchEvent<T extends keyof DispatcherEventMap>(event: CustomEvent<DispatcherEventMap[T]>): boolean;
}

const dispatcher = new EventTarget() as Dispatcher;
export default dispatcher;
