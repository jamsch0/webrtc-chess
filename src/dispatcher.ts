export type DispatchEventListener<T = unknown> = (event: CustomEvent<T>) => void;

type Dispatcher = EventTarget & {
    addEventListener<T>(
        type: string,
        callback: DispatchEventListener<T>,
        options?: AddEventListenerOptions | boolean,
    ): void;

    removeEventListener(type: string, callback: DispatchEventListener, options?: EventListenerOptions | boolean): void;
};

const dispatcher = new EventTarget() as Dispatcher;
export default dispatcher;
