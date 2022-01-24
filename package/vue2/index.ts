import { registerMicroApps, start, RegistrableApp, ObjectType } from 'qiankun';
import VueRouter, { RouteConfig, RouterMode } from "vue-router";
import Vue, { Component } from "vue"
import { CombinedVueInstance } from 'vue/types/vue';
import { unique } from "howtools"

interface HookParams {
    app: CombinedVueInstance<Vue, object, object, object, Record<never, any>>;
    router: VueRouter
}

interface Vue2appOption {
    routes: RouteConfig[];
    mode: RouterMode;
    entryComponent: Component,
    mount: string;
    store?: any,//vuex
    pinia?: any,//pinia 约等于 vuex
    subApps?: Array<RegistrableApp<ObjectType>> //主应用填写
    hook?: ({ app, router }: HookParams) => void //钩子函数，抛出 app 和路由 等其它生命周期钩子
}
interface SubVue2appOption extends Omit<Vue2appOption, "subApps"> {
    created?: () => void; //应用创建之后
    mounted?: (props: ObjectType) => void; //应用挂载完成之后
    unmounted?: () => void; //应用卸载之后
}

export function createMainApp(appOption: Vue2appOption) {
    let router: VueRouter;
    let app: CombinedVueInstance<Vue, object, object, object, Record<never, any>>;

    const mode = appOption.mode || 'history'
    const mountId = appOption.mount //index.html 里面的ID
    const entryComponent = appOption.entryComponent
    const subApps = appOption.subApps || []

    if (unique(subApps, 'name').length != subApps.length) {
        throw new Error("Micro app name cannot be duplicate")
    }

    if (unique(subApps, 'activeRule').length != subApps.length) {
        throw new Error("Micro app activeRule cannot be duplicate")
    }

    if (!entryComponent) {
        throw new Error("entryComponent cannot be empty")
    }

    //微应用加载函数
    function render() {
        if (subApps.length == 0) {
            console.warn("no register any sub app , place check your settings")
        }

        router = new VueRouter({
            base: '/',
            mode,
            routes: appOption.routes,
        });


        const option: ObjectType = {}
        if (appOption.store) option.store = appOption.store
        if (appOption.pinia) option.pinia = appOption.pinia

        app = new Vue({
            router,
            ...option,
            render: h => h(entryComponent)
        })

        //抛出路由钩子
        if (appOption.hook) {
            appOption.hook({ app, router })
        }

        app.$mount(mountId);
    }

    render();
    registerMicroApps(subApps);
    start();

    return {
        app,
        router,
    }
}

export function createSubApp(appOption: SubVue2appOption) {
    let router: VueRouter;
    let app: CombinedVueInstance<Vue, object, object, object, Record<never, any>>;

    const mode = appOption.mode || 'history'
    const entryDomId = appOption.mount
    const entryComponent = appOption.entryComponent || {}

    //微应用加载函数
    function render({ name: appName, container }: ObjectType) {

        if (!entryDomId) {
            throw new Error("not entryDomId , is error")
        }

        const routerUrl = window.__POWERED_BY_QIANKUN__ ? `/${appName}` : `/`

        router = new VueRouter({
            base: routerUrl,
            mode,
            routes: appOption.routes,
        });


        const option: ObjectType = {}
        if (appOption.store) option.store = appOption.store
        if (appOption.pinia) option.pinia = appOption.pinia

        app = new Vue({
            router,
            ...option,
            render: h => h(entryComponent)
        })

        //抛出路由钩子
        if (appOption.hook) {
            appOption.hook({ app, router })
        }

        app.$mount(container ? container.querySelector(`${entryDomId}`) : `${entryDomId}`);
    }

    if (!window.__POWERED_BY_QIANKUN__) {
        render({});
    }

    async function bootstrap() {
        appOption.created && appOption.created()
    }

    async function mount(props) {
        console.log('props from main framework', props);
        render(props);
        appOption.mounted && appOption.mounted(props)
    }

    async function unmount() {
        app = null;
        router = null;
        appOption.unmounted && appOption.unmounted()
    }

    const life = {
        bootstrap,
        mount,
        unmount,
        router
    }

    return life
}