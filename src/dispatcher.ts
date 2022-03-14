declare global {
    interface DispatcherEventMap {
    }
}

type EventListener<T extends keyof DispatcherEventMap> = (event: CustomEvent<DispatcherEventMap[T]>) => void;

interface Dispatcher {
    addEventListener<T extends keyof DispatcherEventMap>(
        type: T,
        callback: EventListener<T> | EventListenerObject,
        options?: AddEventListenerOptions | boolean,
    ): void;

    removeEventListener<T extends keyof DispatcherEventMap>(
        type: T,
        callback: EventListener<T> | EventListenerObject,
        options?: EventListenerOptions | boolean,
    ): void;

    dispatchEvent<T extends keyof DispatcherEventMap>(event: CustomEvent<DispatcherEventMap[T]>): boolean;
}

const dispatcher = new EventTarget() as Dispatcher;
export default dispatcher;
