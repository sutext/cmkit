interface String {
    /**
     * @description parse the url string to formated object
     */
    readonly parsed: () => {
        readonly query: string;
        readonly host: string;
        readonly schema: string;
        readonly [key: string]: string;
    };
    /**
     * @description fix the length of number
     * @example '1'.fixlen(2) -> '01' '12331'.fixlen(3)->'331'
     * @param len must be positive nonzero number otherwise use @default 2
     */
    readonly fixlen: (len?: number) => string;
}
interface Date {
    /** @example 59:45 */
    readonly mmss: string;
    /** @example 08:00*/
    readonly hhmm: string;
    /** @example 23:59:45*/
    readonly hhmmss: string;
    /**
     * @description format the Date to string
     * @param fmt @example 'yyyy-MM-dd hh:mm:ss'
     */
    readonly format: (fmt: string) => string;
}
interface Number {
    /**
     * @example trun 1.3411111 to 1.35 when precision=2
     * @param precision the permision must be nonnegative number otherwise use @default 0
     */
    readonly ceil: (precision?: number) => number;
    /**
     * @example trun 1.34567 to 1.34 when precision=2
     * @param precision the permision must be nonnegative number otherwise use @default 0
     */
    readonly floor: (precision?: number) => number;
    /**
     * @example trun 1.34567 to 1.35 when precision=2
     * @param precision the permision must be nonnegative number otherwise use @default 0
     */
    readonly round: (precision?: number) => number;
    /**
     * @description insert comma symbol to the integer part
     * @example 23123.1234.comma -> '23,123.1234'
     */
    readonly comma: () => string;
    /**
     * @description fix the length of number
     * @example 1.fixlen(2) -> '01' 1987.fixlen(3) -> '987'
     * @param len must be positive nonzero number otherwise use @default 2
     */
    readonly fixlen: (len?: number) => string;
    /**
     * @description get index symbol of int number @example 23 -> 23rd @returns 'rd'
     */
    readonly symidx: 'st' | 'nd' | 'rd' | 'th';
}
interface Array<T> {
    /**
     * @description get the last element from the stack
     */
    readonly last: T | undefined;
    /**
     * @description get the first element from the stack
     */
    readonly first: T | undefined;
    /**
     * @description get an random index of array return -1 when empty
     */
    readonly ranidx: number;
    /**
     * @description get an random item from arrary,if empty return undefined
     */
    readonly random: T | undefined;
    /**
     * @description insert item at index
     * @param item the item to be insert
     * @param index the index of new item
     * @notice the max value of index is the length of befor ary
     */
    readonly insert: (item: T, index: number) => void;
    /**
     * @description append other sequence of T
     * @param ary the sequence which will be append
     * @returns the length of self affter append.
     */
    readonly append: (ary: T[]) => number;
    /**
     * @description delete an object from array
     * @returns the index that been deleted. if not found retrun -1
     * @param item the object need to be delete
     */
    readonly delete: (item: T) => number;
    /**
     * @description delete on at index
     * @returns the object that been deleted if out of bounds retrun undefined
     * @param index the index need to be delete
     */
    readonly remove: (index: number) => T | undefined;
    /**
     * @description judge array contains the item or not.
     * @param item the target item.
     */
    readonly contains: (item: T) => boolean;
}
declare namespace cm {
    /**@description print info message when debug allow */
    const log: (msg: any, ...args: any[]) => void;
    /**@description print wining message when debug allow */
    const warn: (msg: any, ...args: any[]) => void;
    /**
     * @description call func safely
     * @usually  use for call callback function
     * @param func target function
     * @param args the @param func 's args
     * @notice thirArg of @param func is undefined
     */
    const call: (func: Function, ...args: any[]) => void;
    /**
     * @description check an value is an available string
     * @usually  use for form field verify
     * @notice only @param value is number or not empty string can pass
     * @param value witch to be verify
     */
    const okstr: (value: any) => boolean;
    /**
     * @description check an value is an available integer
     * @usually  use for form field verify
     * @notice only @param value is integer like can pass
     * @param value witch to be verify
     */
    const okint: (value: any) => boolean;
    /**
     * @description check an value is an available number
     * @usually  use for form field verify
     * @notice only @param value is number like can pass
     * @param value witch to be verify
     */
    const oknum: (value: any) => boolean;
    /** @description show debug info or not*/
    const debug: boolean;
    /** @description api server name*/
    const apihost: string;
    /** @description config global value*/
    const config: (host: string, debug?: boolean) => void;
}
declare namespace cm {
    abstract class Emitter<E extends string = string> {
        /**
         * @description register event handler to the emitter on target.
         * @notice Only one handler will exist in same target and same event. The later one will be ignore
         * @param event the event
         * @param target the callback's caller
         * @param callback the event handler
         */
        public readonly on: (event: E, target: object, callback: Function) => void;
        /**
         * @description remove event handler of the emitter
         * @example
         * emiter.off('YOUR_EVENT') // remove all the handler of 'YOUR_EVENT'
         * emiter.off(this) // remove all the handler on the 'this' target
         * emiter.off('YOUR_EVENT',this) // only remove the handler of 'YOUR_EVENT' on this target
         * //The following usage is not recommended
         * emiter.off(this,other) // the same as emiter.off(this) other will be ignore.
         */
        public readonly off: (eventOrTarget: E | object, target?: object) => void;
        /**
         * @description register once event handler to the emitter on target
         * @notice Only one handler will exist in same target and same event. The later one will be ignore
         * @param event the event
         * @param target the callback's caller
         * @param callback the event handler
         */
        public readonly once: (event: E, target: object, callback: Function) => void;
        /**
         * @description remove all handler
         */
        protected readonly clear: () => void;
        /**
         * @description dispatch event to all the rigsted handler
         * @param event the event
         * @param args the arguments of callback function
         */
        protected readonly emit: (event: E, ...args: any[]) => void;
    }
    class NoticeCenter extends Emitter<string> {
        /** @description remove all handler */
        public readonly clear: () => void;
        /**
         * @description dispatch event to all the rigsted handler
         * @param event the event
         * @param args the arguments of callback function
         */
        public readonly emit: (event: string, ...args: any[]) => void;
    }
    /**  @description A global shared notice center. */
    const notice: NoticeCenter;
    /**  @description  mark a field of IMetaClass as mapkey in Network.mapreq and Network.maptask. */
    const mapkey: (target: Object, field: string) => void;
    interface IMetaClass<T> {
        new (json?: any): T;
    }
    abstract class Network {
        /**
         * @description the global http headers. every request will include this headers
         * @override you shoud overwrite this property and provide you custom headers
         * @example
         * protected get headers(): any {
         *     return {
         *         token:'yourtoken',
         *         account:'youraccount'
         *     }
         * }
         */
        protected readonly headers: Record<string, string>;
        /**
         * @description the global http request method
         * @override you shoud override this property and provide you custom headers
         * @example
         * protected get method(): any {
         *     return 'POST'
         * }
         */
        protected readonly method: Network.Method;
        /**
         * @description the global request body data reslover
         * @override override point
         * @param data the user request data
         * @return the finnal request data
         */
        protected params(data: any): any;
        /**
         * @description the global hock before every request
         * @override override point
         * @param path the relative uri
         * @param opts the request options
         * @returns go on request or not @default true
         */
        protected before(path: string, opts?: Network.Options): boolean;
        /**
         * @description the global hock after every request
         * @override override point
         * @param path the relative uri
         * @param resp the response data or error
         */
        protected after(path: string, resp?: any | Error): void;
        /**
         * @description global resove relative uri to full url
         * @param path the relative uri
         */
        protected abstract url(path: string): string;
        /**
         * @description the global resp resolver
         * @param json the jsoned respons data
         */
        protected abstract resolve(json: any): any | Promise<any>;
        /** ----- network data request methods */
        readonly upload: <T = any>(path: string, upload: Network.Upload) => Network.UploadTask<T>;
        readonly anyreq: <T = any>(req: Network.Request<T>) => Network.DataTask<T>;
        readonly objreq: <T>(req: Network.Request<T>) => Network.DataTask<T>;
        readonly aryreq: <T>(req: Network.Request<T>) => Network.DataTask<T[]>;
        readonly mapreq: <T>(req: Network.Request<T>) => Network.DataTask<Record<string, T>>;
        readonly anytask: <T = any>(path: string, data?: any, opts?: Network.Options) => Network.DataTask<T>;
        readonly objtask: <T>(meta: IMetaClass<T>, path: string, data?: any, opts?: Network.Options) => Network.DataTask<T>;
        readonly arytask: <T>(meta: IMetaClass<T>, path: string, data?: any, opts?: Network.Options) => Network.DataTask<T[]>;
        /**
         * @description create a map result http task.
         * @param meta the meta class of Data @notice the cm.mapkey field must be exist in meta, otherwise 'id' used.
         * @param path the uri of http request
         * @param data the data of http request
         * @param opts the options of http request
         */
        readonly maptask: <T>(meta: IMetaClass<T>, path: string, data?: any, opts?: Network.Options) => Network.DataTask<Record<string, T>>;
    }
    namespace Network {
        type Method = 'POST' | 'GET';
        type ErrorType = 'abort' | 'timeout' | 'service' | 'business';
        interface Upload {
            readonly name: string;
            readonly data: Blob;
            readonly type: string;
            readonly opts?: Pick<Options, 'headers' | 'parser' | 'timeout' | 'loading'>;
            readonly params?: Record<string, any>;
        }
        interface Request<T> {
            readonly path: string;
            readonly meta: IMetaClass<T> | T;
            readonly data?: any;
            readonly opts?: Options;
        }
        interface Options {
            /** @description use for override global methods */
            readonly method?: Method;
            /** @description use for override global headers */
            readonly headers?: Record<string, string>;
            /** @default 10000 */
            readonly timeout?: number;
            /**
             * @description You must provide your loading UI in before or after hock. otherwith it does't work!
             * @see Network.before @see Network.after.
             */
            readonly loading?: boolean;
            /**
             * @description the response type for xhr.responseType
             * @default 'json'
             */
            readonly resptype?: 'json' | 'text';
            /** @description use for override global reslove method */
            readonly parser?: (resp: any) => any;
        }
        class Error {
            readonly type: ErrorType;
            readonly status: number;
            readonly message: string;
            private constructor();
            static readonly abort: (status: number) => Error;
            static readonly timeout: (status: number) => Error;
            static readonly service: (status: number) => Error;
        }
        interface DataTask<T> {
            readonly then: <TResult1 = T, TResult2 = never>(
                onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
                onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
            ) => Promise<TResult1 | TResult2>;
            readonly catch: <TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>) => Promise<T | TResult>;
            readonly abort: () => void;
            readonly onProgress: (func: (evt: ProgressEvent) => void) => void;
        }
        interface UploadTask<T> extends DataTask<T> {
            readonly onProgress: (func: (evt: ProgressEvent) => void) => void;
        }
        /**
         * @description create http request
         * @param url absolute url of request
         * @param data request data
         * @param opts request options
         */
        const http: (url: string, data?: any, opts?: Options) => [Promise<any>, XMLHttpRequest];
        /**
         * @description create http request with method 'GET'
         * @notice @param method in @param opts dos't effect
         * @param url absolute url of request
         * @param data request data
         * @param opts request options
         */
        const get: (url: string, data?: any, opts?: Options) => [Promise<any>, XMLHttpRequest];
        /**
         * @description create http request with method 'GET'
         * @notice @param method in @param opts dos't effect
         * @param url absolute url of request
         * @param data request data
         * @param opts request options
         */
        const post: (url: string, data?: any, opts?: Options) => [Promise<any>, XMLHttpRequest];
    }
    /** @description Wrapped on WebSocket and has implement retry mechanis */
    class Socket {
        binaryType: BinaryType; /** @default 'arraybuffer' */
        readonly retry: Socket.Retry; /** @description retry settings */
        readonly send: (data: BlobPart) => void;
        readonly open: () => void;
        readonly close: (code?: number, reason?: string) => void;
        readonly isRetrying: boolean;
        readonly protocol: string;
        readonly extensions: string;
        readonly readyState: number;
        readonly bufferedAmount: number;
        onopen: (evt: Event, isRetry: boolean) => void;
        onclose: (evt: CloseEvent, reason: Socket.Reason) => void;
        onerror: (evt: ErrorEvent) => void;
        onmessage: (evt: MessageEvent) => void;
        constructor(builder: () => string, protocols?: string | string[]);
    }
    namespace Socket {
        const OPEN: number;
        const CLOSED: number;
        const CLOSING: number;
        const CONNECTING: number;
        type Reason = 'user' | 'ping' | 'retry' | 'server';
        type Events = 'open' | 'error' | 'close' | 'message';
        type Status = 'closed' | 'closing' | 'opened' | 'opening';
        /** @description A retry machine for web socket  */
        interface Retry {
            /**
             * @description base attempt delay time @default 100 milliscond
             * @description the real delay time use a exponential random algorithm
             */
            delay: number;
            /** @description allow ping pong mechanism or not. @default true */
            allow: boolean;
            /** @description the max retry times when retrying @default 8 */
            chance: number;
        }
        interface Ping {
            /**
             * @description allow ping pong mechanism or not.
             * @default true
             * @warn It doesn't work affter socket has been started.
             */
            allow: boolean;
            /**
             * @description the time interval of ping
             * @default 30s
             * @notice It doesn't work affter socket has been started.
             */
            interval: number;
        }
        /**
         * @description socket client wrapped on Socket
         * @description you must inherit this class to implements your logic
         * @implements client PING heartbeat mechanis
         * @implements client reconnect  mechanis
         * @notice by defualt the client never emit any event. you must emit it at override point yourself.
         */
        abstract class Client<E extends string = Events> extends Emitter<E> {
            /**
             * @description the client ping mechanis
             * @ping use socket.send("{\"type\":\"PING\"}")
             * @pong receive message = "{\"type\":\"PONG\"}"
             * @note the server must send the specified @pong  when recived @ping otherwhis please close the ping
             */
            protected readonly ping: Ping;
            /** the realy websocket handler */
            protected readonly socket: Socket;
            /** Tell me your login status if not no retry */
            protected abstract readonly isLogin: boolean;
            /** @overwrite this method to provide url for web socket */
            protected abstract buildurl(): string;
            /** call when get some message @override point  @notice the msg has been parsed using JSON.parse.*/
            protected abstract onMessage(msg: any): void;
            /** call when some error occur @override point */
            protected onError(res: ErrorEvent): void;
            /** call when socket opened @override point */
            protected onOpened(res: any, isRetry: boolean): void;
            /** call when socket closed @override point */
            protected onClosed(res: CloseEvent, reason: Reason): void;
            readonly isConnected: boolean; /** the connection status */
            readonly stop: () => void; /** disconnect and stop ping pong retry */
            readonly start: () => void; /** connect the server and start ping pong retry */
        }
    }
    namespace orm {
        /**
         * @description  A class decorate use to store class.
         * @param clskey the class name of your storage class
         * @param idxkey the primary key field name of your storage class
         * @notice the idxkey must be exist in the metaclass
         */
        const store: (clskey: string, idxkey: string) => <T>(target: IMetaClass<T>) => void;
        /**
         * @description  A property decorate to mark a field  also a store class.
         * @param cls the class of field.
         */
        const field: <T>(cls: IMetaClass<T>) => (target: Object, field: string) => void;
        /**
         * @description save an storage able class.
         * @param model the model class must be mark with @storage(...)
         * @throws did't mark error
         */
        const save: <T>(model: T) => void;
        /**
         * @description find an storaged object whith id.
         * @param cls the storage class witch must be mark with @storage(...)
         * @param id the primary key of the cls
         * @throws did't mark error
         */
        const find: <T>(cls: IMetaClass<T>, id: string | number) => T;
        /**
         * @description find all storaged object's primary key of cls.
         * @param cls the storage class witch must be mark with @storage(...)
         * @throws did't mark error
         */
        const ids: <T>(cls: IMetaClass<T>) => string[];
        /**
         * @description find all storaged object of cls.
         * @param cls the storage class witch must be mark with @storage(...)
         * @throws did't mark error
         */
        const all: <T>(cls: IMetaClass<T>) => T[];
        /**
         * @description get the count of all storaged object of cls.
         * @param cls the storage class witch must be mark with @storage(...)
         * @throws did't mark error
         */
        const count: <T>(cls: IMetaClass<T>) => number;
        /**
         * @description remove all storaged object of cls.
         * @param cls the storage class witch must be mark with @storage(...)
         * @throws did't mark error
         */
        const clear: <T>(cls: IMetaClass<T>) => void;
        /**
         * @description remove an special storaged object of cls.
         * @param cls the storage class witch must be mark with @storage(...)
         * @param id the primary key of the cls
         * @throws did't mark error
         */
        const remove: <T>(cls: IMetaClass<T>, id: string | number) => void;
    }
}
