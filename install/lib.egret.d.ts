/// <reference path="lib.web.d.ts" />

declare namespace egret {
    interface DisplayObject {
        /** the edge store propery use for exml */
        readonly edge: string;
        /**
         * @description set the eui.UIComponent margin fastly
         * @warn this method only available on eui.UIComponent's implementation
         * @example
         * this.setEdge('10,15,20,25')// this.left=10,this.right=15,this.top=20,this.bottom=25;
         * this.setEdge(10);//this.left=this.right=this.top=this.bottom=10;
         * this.setEdge('10');//this.left=this.right=this.top=this.bottom=10;
         * this.setEdge('10,10');//throw error!
         */
        readonly setEdge: (edge: number | string) => void;
        readonly setRect: (x: number, y: number, width: number, height: number) => void;
        readonly setSize: (width: number, height: number) => void;

        /**
         * @description set scale fastly
         * @param xOrBoth scaleX or scaleX=scaleY
         * @param y scaleY
         * @example
         * this.setScale(0.5);//this.scaleX=this.scaleY=0.5;
         * this.setScale(0.3,0.4);//this.scaleX=0.3;this.scaleY=0.4;
         */
        readonly setScale: (xOrBoth: number, y?: number) => void;
        /** remove itself from parent if exist */
        readonly remove: () => void;
    }
}
declare namespace eui {
    interface Component {
        /**
         * @description Hook method for removed from stage
         * @description This method will be call affter component has been remove from stage.
         * @description You can do your clear work here.
         * @warn You shoud never call this method directly
         * @warn This method is undefined before you provide your implemention
         */
        onRemoved(): void;
    }
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
        /**
         * @description set image with url
         * @param src the image src it can be a url or blob data
         * @param placeholder the placeholder image or image key
         * @returns the eui Image itself
         * @example
         * ```
         * const image = new eui.Image()
         * image.setURL('https://yourdomain.com/xxx.png','defualt_avatar_png').then(img=>{
         *      console.log(img.texture)
         *      img.adjust(100)//adjust if need
         * })
         * ```
         */
        readonly setURL: (src: string, placeholder?: egret.Texture | string) => Promise<Image>;
    }
    interface Button {
        /**
         * @description set buton icon with url
         * @param src the image src it can be a url or blob data
         * @param placeholder the placeholder image or image key
         * @returns the button itself
         * @example
         * ```
         * const button = new eui.Button()
         * button.setIcon('https://yourdomain.com/xxx.png','defualt_avatar_png').then(btn=>{
         *      console.log(btn.icon)
         * })
         * ```
         */
        readonly setIcon: (src: string, placeholder?: egret.Texture | string) => Promise<Button>;
    }
}
declare namespace cm {
    const loadtxe: (url: string) => Promise<egret.Texture>;
}
declare namespace cm {
    /**
     * @description 用于快速添加点击事件 和实现点击音效
     * @description 增加按钮常见属性描述，可用于构建复杂的按钮UI
     */
    class Button extends eui.Button {
        /** 全局按钮点击音效，声音文件的资源名称 @default 'btn_tap_mp3' */
        public static sound: string;
        /** 是否开启所有按钮的静音模式 ，静音模式下所有的cm.Button 将不再有音效 */
        public static quiet: boolean;
        /** 按钮填充色 */
        public fill: number;
        /** 按钮图标 此字段继承自 eui.Button */
        public icon: string | egret.Texture;
        /** 按钮背景图片 此字段可 主要用于显示按钮背景图片可以为 color imageKey textrue*/
        public image: string | egret.Texture;
        /** 按钮标签label 此字段继承于 eui.Button */
        public label: string;
        /** 按钮标题title 与按钮label 分别独立使用，可用于按钮上显示两种不同样式的文本 */
        public title: string;
        /** 当前 Button 是否静音 */
        public quiet: boolean;
        /** 点击音效 资源KEY  */
        public sound: string;
        /** 相邻两次触发点击事件的最小间隔时间，防止点击过快 @default 200 ms */
        public delay: number;
        /** 显示填充色的eui.Rect对象*/
        public fillDisplay: eui.Rect;
        /** 显示icon的Image对象 */
        public iconDisplay: eui.Image;
        /** 显示背景图片的的Image对象 */
        public imageDisplay: eui.Image;
        /** 显示title的Label对象 */
        public titleDisplay: eui.Label;
        /** 显示label的Label对象 */
        public labelDisplay: eui.Label;
        /** 点击回调事件 */
        public onclick: () => void;
        /**
         * @description set buton image with url
         * @param src the image src it can be a url or blob data
         * @param placeholder the placeholder image or image key
         * @returns the button itself
         * @example
         * ```
         * const button = new eui.Button()
         * button.setIcon('https://yourdomain.com/xxx.png','defualt_avatar_png').then(btn=>{
         *      console.log(btn.image)
         * })
         * ```
         */
        readonly setImage: (src: string, placeholder?: egret.Texture | string) => Promise<Button>;
    }
    /** 实现eui.Label的滚动数字效果，和滚动音效 */
    class Label extends eui.Label {
        /** 是否开启所有Label的静音模式 ，静音模式下所有的cm.Label 将不再有音效 */
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
        public readonly push: <P>(page: Stack.Page<P>, props?: P, finish?: () => void) => void;
        public readonly reload: (root: Stack.Page) => void;
        /** @description delete and destroy a page node from the stack */
        public readonly delete: (page: Stack.Page) => void;
    }
    namespace Stack {
        /** @description the base class of Stack Page */
        abstract class Page<P = any> extends eui.Component {
            public readonly stack: Stack;
            /** push options */
            protected readonly props?: Readonly<P>;
            protected willShow(): void;
            protected willHide(): void;
            protected didShow(): void;
            protected didHide(): void;
        }
    }
}
declare namespace cm {
    class Popup extends eui.UILayer {
        protected errmsg: string; /** defalut error mesaage @default 'System Error!'' */
        protected opacity: number; /** The background fillAlpha @default 0.4 */
        public readonly present: (meta: typeof Popup.Modal, opts?: { skin?: eui.Skin | string; onhide?: Function; [key: string]: any }) => void;
        public readonly dismiss: (meta?: typeof Popup.Modal, finish?: () => void) => void;
        public readonly remind: (msg: string, opts?: { skin?: eui.Skin | string; title?: string; duration?: number }) => void;
        public readonly alert: (msg: string, opts?: Popup.Options) => void;
        public readonly error: (error: any) => void; /** remind error.message or Popver.errmsg */
        public readonly wait: (msg?: string, skin?: eui.Skin | string) => void;
        public readonly idle: () => void;
    }
    namespace Popup {
        abstract class Modal extends eui.Component {
            /**
             * @description Popup.Modal.NAME means a kind of Modal. Popup can only present one by same NAME
             * @notice For custom Modal you must overwride this and provide an unique name
             * @example
             * class CustomModal extends cm.Popup.Modal{
             *      protected static NAME = 'CustomModal'
             * }
             */
            protected static NAME: string;
            /** @default -1 use parent opacity */
            protected opacity: number;
            /** @description use for special animation @example bounce in Popup.present and rotate in Popup.wait */
            protected animator: eui.Group;
            /** @description fade-in-out background only or fade-in-out all */
            protected fadeback: boolean;
            /**@description insert by present opts.onhide */
            protected onhide?: Function;
            /**@description The click action fom dimming blur @default this.dismiss .set null for disable auto dismiss*/
            protected onblur?: () => void;
            /**@default this.onhide=opts&&opts.onhide If you overwride this method. You must consider call super or not */
            protected onCreate(opts?: any): void;
            /**@default empty */
            protected onPresent(opts?: any): void;
            /**@default cm.call(this.onhide) If you overwride this method. You must consider call super or not */
            protected onDismiss(): void;
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
        class Wait extends Modal {
            public timeout: number; /** @default 20s */
            public message: eui.List;
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
            readonly onhide?: Function;
            readonly confirm?: Action;
            readonly skin: eui.Skin | string;
        }
    }
}
declare namespace cm {
    /**
     * @description A scrollable list view impl
     * @event cm.ListView.CHANGE_PAGE trigger when pageIndex change
     * @notice cm.ListView.CHANGE_PAGE only dispatch by user interface. and event.data=pageIndex .
     * @event egret.Event.CHANGING trigger when ListView scroling
     * @event eui.UIEvent.CHANGE_START trigger when ListView scroll start
     * @event eui.UIEvent.CHANGE_END  trigger when ListView scroll stop
     */
    class ListView extends eui.List {
        public static readonly CHANGE_PAGE: string;
        /** bounces or not @default true */
        public bounces: boolean;
        /** ListView disabled means disable scroll or not @default false */
        public disabled: boolean;
        /** The accelerated speed when scroll throw  @unit px/ms/s @default 5*/
        public friction: number;
        /** The ease duration when pageable auto scroll @default 500 @unit ms */
        public easeTime: number;
        /** The ease time function when pageable auto scroll or manual @scrollToOffset @default egret.Ease.sineOut  */
        public easeFunc: (t: number) => number;
        /** Enable page scroll and pageIndex @default false*/
        public pageable: boolean;
        /** The size per page @default 'typicalSize of layout'  */
        public pageSize: number;
        /** The current pageIndex. @notice Set this value will change scroll offset. */
        public pageIndex: number;
        /** scroll direction @param H horizontal @param V vertical  @default 'H' */
        public direction: string;
        /** The max speed that you can throw @unit px/ms @default 20 */
        public maxThrowSpeed: number;
        /** The min offset for start scroll and ent throw @default 5 */
        public scrollThreshold: number;
        /** The percent value of page  change threshold @default 0.4 */
        public changeThreshold: number;
        /** Allow auto set selectedItem when touch end on renderItem @default true */
        public allowAutoSelect: boolean;
        /** the ListView is moving or animating */
        public readonly scroling: boolean;
        /**
         * @description scroll to the head of the list
         * @param time scorll duration @default 0
         */
        public readonly scrollToHead: (time?: number) => void;
        /**
         * @description scroll to the head of the list
         * @param time scorll duration @default 0
         */
        public readonly scrollToTail: (time?: number) => void;
        /**
         * @description scroll to the speacil index of the list
         * @notice The scorll result decide by @pageSize and index.
         * @param index the target index.
         * @param time scorll duration @default 0
         */
        public readonly scrollToIndex: (index: number, time?: number) => void;
        /**
         * @description scroll to the speacil index of the list
         * @param offset the target scroll offset.
         * @param time scorll duration @default 0
         */
        public readonly scrollToOffset: (offset: number, time?: number) => void;
    }
}
