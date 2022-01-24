import { registerMicroApps, start, RegistrableApp, ObjectType } from 'qiankun';
import VueRouter, { RouteConfig, RouterMode } from "vue-router";
import Vue from "vue"
import { CombinedVueInstance } from 'vue/types/vue';
import { unique } from "howtools"

interface Vue2appOption {
    baseUrl: string,
    routes: RouteConfig[];
    mode: RouterMode;
    appName: string;
    entryDomId: string;
    extOption?: ObjectType; //app 额外选项，例如 : {store, render}
    subApps?: Array<RegistrableApp<ObjectType>> //主应用填写
}

export function createMainApp(appOption: Vue2appOption) {
    let router: VueRouter;
    let app: CombinedVueInstance<Vue, object, object, object, Record<never, any>>;

    const mode = appOption.mode || 'history'
    const baseUrl = appOption.baseUrl || '/'
    const appName = appOption.appName
    const entryDomId = appOption.entryDomId
    const extOption = appOption.extOption || {}
    const subApps = appOption.subApps || []

    if (unique(subApps, 'name').length != subApps.length) {
        throw new Error("Micro app name cannot be duplicate")
    }

    if (unique(subApps, 'activeRule').length != subApps.length) {
        throw new Error("Micro app activeRule cannot be duplicate")
    }

    //微应用加载函数
    function render() {
        if (subApps.length == 0) {
            console.warn("no register any sub app , place check your settings")
        }

        router = new VueRouter({
            base: window.__POWERED_BY_QIANKUN__ ? `/${appName}` : baseUrl,
            mode,
            routes: appOption.routes,
        });

        app = new Vue({
            router,
            ...extOption,
        }).$mount(entryDomId);
    }

    render();
    registerMicroApps(subApps);
    start();

    return {
        app,
        router,
    }
}

export function createSubApp(appOption: Vue2appOption) {
    let router: VueRouter;
    let app: CombinedVueInstance<Vue, object, object, object, Record<never, any>>;

    const mode = appOption.mode || 'history'
    const baseUrl = appOption.baseUrl || '/'
    const appName = appOption.appName
    const entryDomId = appOption.entryDomId
    const extOption = appOption.extOption || {}

    //微应用加载函数
    function render(container?: HTMLElement) {
        if (!appName) {
            throw new Error("not appName , is error")
        }

        if (!entryDomId) {
            throw new Error("not entryDomId , is error")
        }

        router = new VueRouter({
            base: window.__POWERED_BY_QIANKUN__ ? `/${appName}` : baseUrl,
            mode,
            routes: appOption.routes,
        });

        app = new Vue({
            router,
            ...extOption,
        }).$mount(container ? container.querySelector(`#${entryDomId}`) : `#${entryDomId}`);
    }

    if (!window.__POWERED_BY_QIANKUN__) {
        render();
    }

    async function mount(props) {
        console.log('props from main framework', props);
        render(props);
    }

    async function unmount() {
        app.$destroy()
        app = null;
        router = null;
    }

    return {
        app,
        router,
        mount,
        unmount
    }
}