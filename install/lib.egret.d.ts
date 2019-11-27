/// <reference path="lib.web.d.ts" />
/// <reference path="lib.cocos.d.ts"/>

declare namespace egret {
    interface DisplayObject {
        readonly setRect: (x: number, y: number, width: number, height: number) => void;
        readonly setSize: (width: number, height: number) => void;
        readonly setEdge: (allOrPart: number | { top?: number; left?: number; bottom?: number; right?: number }) => void;
    }
}
declare namespace eui {
    interface Image {
        /**
         * @description auto resize image size and keep perfect
         * @warn if this.texture is empty this method will not work.
         * @param widthOrBothOrOnly the max display width or both width and height
         * @param height the max display height of image
         * @example
         * ```
         * image.adjust(150) // width<=150 height<=150
         * image.adjust(150,250) // width<=150 height<=250
         * image.adjust({width:150}) // width==150 height auto
         * image.adjust({height:250}) // height==250 width auto
         * //The following usage is not recommended
         * image.adjust({width:150,height:250})  // the same as image.adjust(150,250)
         * image.adjust({width:150,height:250},1000)  // the same as image.adjust(150,250) and 1000 will be ignore
         * image.adjust({width:150},1000)  // the same as image.adjust({width:150}) and 1000 will be ignore
         * image.adjust({height:150},1000)  // the same as image.adjust({height:150}) and 1000 will be ignore
         * ```
         */
        readonly adjust: (widthOrBothOrOnly: number | { width?: number; height?: number }, height?: number) => void;
    }
}
declare namespace cm {
    /**
     * @description 用于快速添加点击事件 和实现点击音效
     */
    class Button extends eui.Button {
        /** 全局按钮点击音效，声音文件的资源名称 @default 'btn_tap_mp3' */
        public static sound: string;
        /** 是否开启所有按钮 的静音模式 ，静音模式下所有的cm.Button 将不再有音效 */
        public static quiet: boolean;
        /** 当前 Button 是否静音 */
        public quiet: boolean;
        /** 点击音效 资源KEY  */
        public sound: string;
        /** 相邻两次触发点击事件的最小间隔时间，防止点击过快 @default 200 ms */
        public delay: number;
        /** 点击回调事件 */
        public onclick: () => void;
    }
    /** 实现eui.Label的滚动数字效果，和滚动音效 */
    class Label extends eui.Label {
        /** 是否开启所有按钮 的静音模式 ，静音模式下所有的cm.Label 将不再有音效 */
        public static quiet: boolean;
        /** 滚动音效  资源KEY*/
        public sound: string;
        /** 当前Counter 是否静音 */
        public quiet: boolean;
        /**设置label的数字，会触发滚动动画，和音效 */
        public digit: number;
        /**
         * @description format the number display style.
         * @notice you can overwrite this method for your custom number format
         * @default value.round().comma()
         * @example
         * ```
         * label.formater = value => value.floor().comma()
         * ```
         */
        public formater: (value: number) => string;
        /**
         * @description arithmetic of the increment setp
         * @notice you can overwrite this method for your custom step arithmetic
         * @default Math.floor(delta/60)
         * @example
         * ```
         * label.steper = delta => Math.floor(delta/60)
         * ```
         */
        public steper: (delta: number) => number;
    }
}
declare namespace cm {
    /**
     * @description A custom managemented navigation  page stack
     * @notice Usually the Stack Component will mount on the Canvas Node
     */
    class Stack extends eui.UILayer {
        public readonly top: Stack.Page;
        public readonly root: Stack.Page;
        public readonly count: number;
        /**
         * @description pop a page from stack
         * @param delta the count of page that will be pop  @default 1
         * @notice if delta < 1 delta=1 will be set;if delta>this.count delta=this.count will be set
         * @param finish the finishcall back @default undefined
         */
        public readonly pop: (deltaOrFinish?: number | (() => void), finish?: () => void) => void;
        public readonly push: (page: Stack.Page, props?: any, finish?: () => void) => void;
        /** @description remove and destroy a page node from the stack */
        public readonly remove: (page: Stack.Page) => void;
    }
    namespace Stack {
        /** @description the base class of Stack Page */
        abstract class Page<P = any> extends eui.Component {
            public readonly stack: Stack;
            /** push options */
            protected props?: P;
            protected willShow(): void;
            protected willHide(): void;
            protected didShow(): void;
            protected didHide(): void;
        }
    }
}
declare namespace cm {
    abstract class Popup extends eui.UILayer {
        protected Wait: typeof Popup.Modal; /** Wait class @default undefined */
        protected Alert: typeof Popup.Modal; /** Alert class @default undefined */
        protected Remind: typeof Popup.Modal; /** Remind class @default undefined */
        protected errmsg: string; /** defalut error mesaage @default 'System Error!'' */
        protected opacity: number; /** The background fillAlpha @default 0.8 */
        public readonly present: (meta: typeof Popup.Modal, opts?: { onhide?: () => void; [key: string]: any }) => void;
        public readonly dismiss: (meta?: typeof Popup.Modal, finish?: () => void) => void;
        public readonly remind: (msg: string, title?: string, duration?: number) => void;
        public readonly alert: (msg: string, opts?: Popup.Options) => void;
        public readonly error: (error: any) => void; /** remind error.message or Popver.errmsg */
        public readonly wait: (msg?: string) => void;
        public readonly idle: () => void;
    }
    namespace Popup {
        abstract class Modal extends eui.Component {
            /**
             * @description Popup.Modal.NAME means a kind of Modal. Popup can only present one by same NAME
             * @notice For custom Modal you must overwride this and provide a single name
             * @example
             * class CustomModal extends cm.Popup.Modal{
             *      protected static NAME = 'CustomModal'
             * }
             */
            protected static NAME: string;
            protected readonly background: eui.Rect;
            /**@description insert by present opts.onhide */
            protected onhide?: () => void;
            /**@default this.onhide=opts&&opts.onhide 如果重写此需要考虑是否调用super */
            protected onCreate(opts?: any): void;
            /**@default empty */
            protected onPresent(opts?: any): void;
            /**@default cm.call(this.onhide) 如果重写此需要考虑是否调用super */
            protected onDismiss(): void;
            /**@default this.dismiss() */
            protected onBackClick(): void;
            protected readonly dismiss: (finish?: () => void) => void;
        }
        class Alert extends Modal {
            public title: eui.Label;
            public cancel: Button;
            public confirm: Button;
            public message: eui.Label;
            public cancelText: eui.Label;
            public confirmText: eui.Label;
        }
        class Remind extends Modal {
            public title: eui.Label;
            public message: eui.Label;
        }
        type Action =
            | {
                  readonly title: string;
                  readonly block?: () => void;
              }
            | string
            | (() => void);
        interface Options {
            readonly title?: string;
            readonly cancel?: Action;
            readonly onhide?: () => void;
            readonly confirm?: Action;
        }
    }
}
