/// <reference path="lib.web.d.ts" />
declare namespace cm {
    /** 实现eui.Label的滚动数字效果，和滚动音效 */
    class Counter extends eui.Component {
        /** 是否开启所有按钮 的静音模式 ，静音模式下所有的cm.Counter 将不再有音效 */
        public static quiet: boolean;
        constructor(label: eui.Label, sound?: any);
        /** 当前Counter 是否静音 */
        public quiet: boolean;
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
         * @default Math.floor(delta/60)
         */
        public steper: (delta: number) => number;
    }
}
