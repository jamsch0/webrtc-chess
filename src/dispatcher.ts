type Dispatcher = EventTarget & {
    addEventListener<T>(
        type: string,
        callback: (event: CustomEvent<T>) => void,
        options?: AddEventListenerOptions | boolean,
    ): void;
};

const dispatcher = new EventTarget() as Dispatcher;
export default dispatcher;
