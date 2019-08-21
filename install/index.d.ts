/// <reference path="lib.cocos.d.ts" />
/// <reference path="lib.cmkit.d.ts" />

declare namespace cm {
    /** @description 游戏全局代理类，用于处理全局消息 */
    abstract class Game {
        /**
         * @description 游戏启动成功时候调用 cc.game.onStart 执行完之后执行此方法
         * @notice 此时游戏场景尚未启动
         * @param scene  默认启动场景
         */
        protected abstract onInit(scene: string): void;
        /** @description 游戏页面出现时候调用 通常是host app 进入前台时调用 */
        protected abstract onShow(): void;
        /** @description 游戏隐藏时候调用 通常是host app 进入后台台时调用 */
        protected abstract onHide(): void;
        /** @description 退出游戏 需提供具体实现*/
        public abstract exit(): void;
    }
    /**
     * @description Mark a Game Entry class. There can only be one game entry
     * @param apihost api主机
     * @param debug 是否开启debug 模式 @default false
     */
    const entry: (apihost: string, debug?: boolean) => <T extends Game>(target: new () => T) => void;
    /** @description 以16进制字符串生成颜色 */
    const color: (hex: string) => cc.Color;
    /** @description 全局游戏代理实例 */
    const game: Game;
    /** @description judge the device‘s screen ratio is greater than 16/9 if true maybe iphoneX */
    const isslim: boolean;

    /**@description loader progress description */
    interface IProgress {
        (completedCount: number, totalCount: number, item: any): void;
    }
    /**@description cc.Asset meta class description */
    interface IMetaAsset<T extends cc.Asset> {
        new (): T;
        preventDeferredLoadDependents: boolean;
        preventPreloadNativeObject: boolean;
    }
    /**
     * @description 对cc.loader.loadRes的封装 加载并缓存 resources 目录里面的资源
     * @param type 资源类型
     * @param url 资源路径 相对于resources目录
     * @param progress 加载进度
     */
    const loadres: <T extends cc.Asset>(type: IMetaAsset<T>, url: string, progress?: IProgress) => Promise<T>;
    /**
     * @description 对cc.loader.loadResArray的封装 批量加载并缓存 resources 目录里面的资源
     * @param type 资源类型
     * @param urls 资源路径列表 相对于resources目录
     * @param progress 加载进度
     */
    const loadress: <T extends cc.Asset>(type: IMetaAsset<T>, urls: string[], progress?: IProgress) => Promise<T[]>;
    /**
     * @description 对cc.loader.loadResDir的封装 批量加载并缓存 resources 的一个子目录
     * @param dir 资源目录 相对于resources
     * @param progress 加载进度
     */
    const loaddir: <T extends cc.Asset>(
        type: IMetaAsset<T>,
        dir: string,
        progress?: IProgress
    ) => Promise<{
        assets: T[];
        urls: string[];
    }>;
    /**
     * @description 加载远程图片资源
     * @param url 完整url地址
     * @param progress 加载进度
     */
    const loadtxe: (url: string, progress?: IProgress) => Promise<cc.Texture2D>;
    /**
     * @description 加载并缓存 一个dragonBones骨骼动画
     * @param dir 资源目录 相对于resources
     * @param name 骨骼动画文件名 不带后缀 骨骼动画三个文件必须一致规范命名
     * @example {name}_ske.json,{name}_tex.json,{name}_tex.png
     * @param progress 加载进度
     */
    const loadbone: (dir: string, name: string) => Promise<[dragonBones.DragonBonesAsset, dragonBones.DragonBonesAtlasAsset]>;
}
declare namespace cc {
    interface Button {
        /**
         * @description 快速添加button的点击回调事件
         */
        onclick: Function;
        /**
         * @description 按钮点击时触发的点击音效名称，如果设置为空则不触发音效,音频资源必须放在resources/audios/目录下
         * @example resources/audios/tap.mp3存在则可通过设置clickSound.name='tap'来实现点击音效
         * @default 'btn_tap' make sure the btn_tap.mp3 exists in resources/audios/
         */
        clickSound: string;
    }
    interface Node {
        /**
         * @description set the rect of node
         * @param x the x  of the node
         * @param y the x  of the node
         * @param width the x  of the node
         * @param height the x  of the node
         */
        readonly setRect: (x: number, y: number, width: number, height: number) => void;
        /**
         * @description set the size of node
         * @param width the x  of the node
         * @param height the x  of the node
         */
        readonly setSize: (width: number, height: number) => void;
        /**
         * @description capture an image from the node
         * @description the image format is 'image/png' in base64
         */
        readonly capture: () => string;
        /**
         * @param dir dir relative resources dir
         * @param name the bone name @see cm.loadbone
         */
        readonly setBone: (dir: string, name: string) => Promise<dragonBones.ArmatureDisplay>;
    }
    interface Texture2D {
        /**
         * @description change an texture into base64 image
         * @param scale @default 1
         */
        readonly base64: (scale?: number) => string;
    }
    interface Sprite {
        /**
         * @description 自动适应精灵的尺寸
         * @param width the max display width of sprite
         * @param height the max display height of sprite
         */
        readonly adjust: (width: number, height: number) => void;
        /**
         * @description 通过远程url 或者 相对于 resources 目录的url 加载图片
         * @param url remote url or localurl
         * @param placeholder the placeholder url just suport local url
         */
        readonly setImage: (url: string, placeholder?: string, progress?: cm.IProgress) => Promise<cc.Sprite>;
        /**
         * @description 用于加载图集的一张图片
         * @param atlas 图集url 相对于resourses 的目录
         * @param name 图集中的图片名称，不带后缀
         * @param progress 加载进度
         */
        readonly setAtlas: (atlas: string, name: string, progress?: cm.IProgress) => Promise<cc.Sprite>;
    }
}
declare namespace dragonBones {
    interface ArmatureDisplay {
        /**
         * @description run animation name of current armature,this method will cancel previous runing animation
         * @param name ani name
         * @param options ani options
         * @param scale the time scale more scael more fast
         * @param times play times 0:for ever -1:use setting >0:times
         * @param completed the callback of animation completed
         * @param target the completed call back target
         */
        readonly runani: (name: string, options?: { scale?: number; times?: number; completed?: (evt: cc.Event) => void; target?: any }) => void;
        /**
         * @description stop current runed  animation from runani
         */
        readonly delani: () => void;
    }
}
declare namespace cm {
    class Modal extends cc.Component {
        /**背景按钮，若blurquit为true则onclick方法自动关联dismiss方法，否则为undefined */
        protected readonly blur: cc.Button;
        /**@default this.onhide=opts&&opts.onhide */
        protected onCreate(opts?: any): void;
        /**@default empty */
        protected onPresent(opts?: any): void;
        /**@default cm.call(this.onhide) */
        protected onDismiss(): void;
        /**@description insert by present opts.onhide */
        protected onhide?: () => void;
        protected readonly dismiss: (finish?: () => void) => void;
    }
    namespace Alert {
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
    namespace pop {
        const present: (prefeb: string | cc.Prefab, opts?: { onhide?: () => void; [key: string]: any }) => void;
        const dismiss: (name?: string, finish?: () => void) => void;
        const remind: (msg: string, title?: string, duration?: number) => void;
        const alert: (msg: string, opts?: Alert.Options) => void;
        /** remind error.message or pop.unknownError */
        const error: (error: any) => void;
        const wait: (msg?: string) => void;
        const idle: () => void;
    }
    class SKPage<P = any> extends cc.Component {
        public readonly stack: Stack;
        /** push options */
        protected props?: P;
        protected willShow(): void;
        protected willHide(): void;
        protected didShow(): void;
        protected didHide(): void;
    }
    /**
     * @description A custom managemented navigation  page stack
     * @notice Usually the Stack Component will mount on the Canvas Node
     */
    class Stack extends cc.Component {
        public readonly top: SKPage;
        public readonly root: SKPage;
        public readonly count: number;
        /**
         * @description pop a page from stack
         * @param delta the count of page that will be pop  @default 1
         * @notice if delta < 1 delta=1 will be set;if delta>this.count delta=this.count will be set
         * @param finish the finishcall back @default undefined
         */
        public readonly pop: (deltaOrFinish?: number | (() => void), finish?: () => void) => void;
        public readonly push: (name: string, props?: any, finish?: () => void) => void;
        /**
         * @description get the stack of current scene
         * @warn if Stack did't mount on root Canvan node,null will be retrun
         */
        public static readonly current: Stack;
    }
    /**
     * @description the base class of all list item
     * @notice user must implement the setData(data:T) to provide refresh method.
     * @notice the template type T is the data model
     */
    abstract class ListItem<T = any> extends cc.Component {
        /** the reference of the listView */
        public readonly list: ListView<T>;
        /** the current index off this item in list's datas set */
        public readonly index: number;
        /** subclass must implement this method to refresh item data */
        protected abstract setData(data: T): void;
    }
    /**
     * @description tanagement of cc.ScrollView. Just implement the item cache and reuse mechanism.
     * @notice the reference of scrollView must be provide.
     * @notice the template type T is the data model
     */
    class ListView<T = any> extends cc.Component {
        /** all created item of the list */
        public readonly items: ListItem<T>;
        /** the current datas of list */
        public readonly datas: T[];
        /** the cc.Mask's node height off scrollview, also means the max visable height off list  */
        public readonly maskHeight: number;
        /** the item height of all items */
        public readonly itemHeight: number;
        /** preload count of top or bottom side */
        public readonly cacheCount: number;
        /** the item prefe of the list */
        public readonly itemPrefeb: cc.Prefab;
        /** the reference of the scrolView */
        public readonly scrollView: cc.ScrollView;
        /** append new datas to the last of list */
        public readonly pushData: (datas: T[]) => void;
        /** reset the list status */
        public readonly reloadData: (datas: T[]) => void;
        /** trigger when list will reach bottom */
        public onbottom: () => void;
    }

    /** 实现cc.Label的滚动数字效果，和滚动音效 */
    class Counter extends cc.Component {
        /**设置label的数字，会触发滚动动画，和音效 */
        public digit: number;
        /**
         * @description format the number display style.
         * @notice you can overwrite this method for your custom number format
         * @default value.round().comma()
         */
        public formater: (value: number) => string;
        /**
         * @description arithmetic of the increment setp
         * @notice you can overwrite this method for your custom step arithmetic
         * @default Math.floor(delta/cc.game.frameRate)
         */
        public steper: (delta: number) => number;
    }
    /**为cc.Label添加文字阴影 */
    class Shadow extends cc.Component {
        public readonly color: cc.Color;
        public readonly offset: cc.Vec2;
        public readonly target: cc.Label;
        public string: string;
    }
    /**
     * @description 实现节点圆角
     * @notice 此控件依赖cc.Mask，并将接管cc.Mask的效果，此时设置cc.Mask的type无效
     */
    class Corner extends cc.Component {
        /**圆角半径 */
        public radius: number;
    }
}
