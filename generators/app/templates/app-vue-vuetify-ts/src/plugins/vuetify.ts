import Vue from 'vue';
// @ts-ignore
import Vuetify from 'vuetify/lib';
// import LRU from 'lru-cache';
import variables from '../styles/main.scss';

Vue.use(Vuetify);

// const themeCache = new LRU({
//     max: 10,
//     maxAge: 1000 * 60 * 60, // 1 hour
// })

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: variables.primaryOne,
                secondary: variables.primaryTwo,
                accent: variables.secondaryOne,
                success: variables.secondaryTwo,
                warning: variables.secondaryThree,
                error: variables.destinction
            },
        },
        // options: {
        //     themeCache,
        //     minifyTheme: function (css: any) {
        //         return process.env.NODE_ENV === 'production'
        //             ? css.replace(/[\s|\r\n|\r|\n]/g, '')
        //             : css
        //     }
        // },
    },
    icons: {
        iconfont: 'fa',
    },
});