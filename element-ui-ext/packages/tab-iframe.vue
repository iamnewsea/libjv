<template>
    <el-tabs ref="tabs" type="card" v-model="tabName"
             v-bind="[$attrs]"
             class="iframe-tab"
             :before-leave="tab_leave"
             @tab-remove="tab_remove"
             v-if="list.length"
    >
        <el-tab-pane v-for="tab in list" :name="tab.name" :label="tab.name + ' '"
                     :key="tab.path" :closable="tab.name != homeName">
            <iframe frameborder="no" :src="tab.path_com"
                    v-if="tabName == tab.name || loadedTabs.includes(tab.name)"
                    style="flex: 1;display: flex;flex-direction: column;width:100%"
            ></iframe>
        </el-tab-pane>
    </el-tabs>
</template>

<script>

//$router.push ，刷新URL，不刷新页面。

export default {
    name: "tab-iframe",
    data() {
        return {
            loadedTabs: [],
            tabName: "",
            list: [],
        };
    },
    props: {
        value: {
            type: String, default: () => null
        },
        homeName: {type: String, default: () => "首页"},
        homePath: {type: String, default: () => "/"},
    },
    watch: {
        "$route": {
            immediate: true, deep: true, handler() {
                this.init();
            }
        },
        value: {
            deep: true,
            immediate: true,
            handler(val) {
                if (val === null) {
                    return;
                }
                this.tabName = val;
            }
        },
        tabName(v) {
            if (v === null) {
                return;
            }

            var tabs = localStorage.getJson(jv.tabs_key);
            if (!tabs) {
                tabs = [new jv.TabItemData(this.homeName, this.homePath)]
            } else {
                tabs = tabs.map(it => new jv.TabItemData(it.name, it.root, it.path));
            }
            var item = tabs.last(it => it.name == v);

            this.$router.safePushRoute(item.path)
            // history.pushState('', '', BASE_URL.slice(0, -1) + item.path);
            this.$emit("change", item);
        }
    },
    created() {
        jv.tabIframe = this;
    },
    methods: {
        closeTab(tabName) {
            this.list = this.list.removeItem(it => it.name == tabName);
            this.saveList(this.list);
        },
        closeOther(tabName) {
            this.list = this.list.removeItem(it => it.name != tabName && it.name != this.homeName);
            this.saveList(this.list);
        },
        activeTab(tabName) {
            this.tabName = tabName;
        },
        reloadByUrl(path) {
            var tabs = this.getTabs();
            var tab = tabs.last(it => it.path == path);
            if (!tab) {
                return false;
            }

            var tabName = tab.name;
            this.activeTab(tabName);

            var index = this.list.map(it => it.name).indexOf(tabName);
            var content = this.$refs.tabs.$el.querySelector(".el-tabs__content");
            var content_iframe = content.children[index].children[0];
            if (content_iframe) {
                content_iframe.src = content_iframe.src;
            }

            this.$router.safePushRoute(path);
            return true;
        },
        fullscreen(tabName) {
            this.activeTab(tabName);

            //移除其它全屏iframe
            var ori_full = document.querySelector("iframe.fullscreen");
            if (ori_full) {
                ori_full.classList.remove("fullscreen");
            }

            var element = document.documentElement;
            var fullscreenCmd = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;
            if (fullscreenCmd) {
                fullscreenCmd.call(element);
            }

            //找对应tab的iframe
            var index = this.list.map(it => it.name).indexOf(tabName);
            var content = this.$refs.tabs.$el.querySelector(".el-tabs__content");
            var content_iframe = content.children[index].children[0];

            //设置 iframe 全屏样式,并设置容器页面全屏样式
            content_iframe.classList.add("fullscreen");
            document.body.classList.add("fullscreen");

            //渲染退出全屏按钮,它是渲染到容器页面上的.
            var full_div = document.body.querySelector(".fullscreen-div");
            if (!full_div) {
                full_div = document.createElement("div");
                document.body.appendChild(full_div);
                full_div.addEventListener("click", jv.exit_fullscreen)
                full_div.classList.add("fullscreen-div")
            }
            full_div.style.animation = "loading 1s"

            //激活浏览器的全屏
            setTimeout(() => {
                document.once('fullscreenchange', jv.exit_fullscreen);
                document.once('webkitfullscreenchange', jv.exit_fullscreen);
                document.once('mozfullscreenchange', jv.exit_fullscreen);
                document.once('MSFullscreenChange', jv.exit_fullscreen);
            }, 100)
        },
        toHomeTab(tabName) {
            this.activeTab(tabName)
            var tab = this.list.filter(it => it.name == tabName)[0];
            tab.path = tab.root;
            this.$nextTick(() => {
                this.saveList(this.list);
            });
        },
        init() {
            var tabs = localStorage.getJson(jv.tabs_key);
            if (!tabs) {
                tabs = [new jv.TabItemData(this.homeName, this.homePath)]
            }

            var tabName = jv.getRouteMetaTabName() || this.homeName;

            //去除以 _开头及结尾的key
            this.setTab(tabName, jv.getUrlWithout_(this.$route.fullPath));
        },
        reload(tabName) {
            var tabs = localStorage.getJson(jv.tabs_key);
            tabs = tabs.map(it => new jv.TabItemData(it.name, it.root, it.path));

            this.list = tabs;
            this.activeTab(tabName);
        },
        /**
         * 获取tabs数据
         * @returns [TabItemData]
         */
        getTabs() {
            return (localStorage.getJson(jv.tabs_key) || []).map(it => new jv.TabItemData(it.name, it.root, it.path));
        },
        setTab(tabName, path) {
            var tabs = localStorage.getJson(jv.tabs_key);
            if (!tabs) {
                tabs = [new jv.TabItemData(this.homeName, this.homePath)]
            } else {
                tabs = tabs.map(it => new jv.TabItemData(it.name, it.root, it.path));
            }

            if (!this.loadedTabs.includes(tabName)) {
                this.loadedTabs.push(tabName);
            }

            this.activeTab(tabName);
            var last = tabs.last(it => it.name == tabName);

            if (last) {
                last.path = path;
            } else {
                tabs.push(new jv.TabItemData(tabName, path));
            }
            this.saveList(tabs);

            this.$router.safePushRoute(path);
        },
        saveList(tabs) {
            localStorage.setJson(jv.tabs_key, tabs);
            this.list = tabs;
        },
        tab_leave(tab, oldActiveName) {
            if (!this.loadedTabs.includes(tab)) {
                this.loadedTabs.push(tab);
            }

            var item = this.list.last(it => it.name == tab);
            if (!item) {
                return;
            }

            this.$router.safePushRoute(item.path);

            // top.history.pushState('', '', BASE_URL.slice(0, -1) + item.path);
        },
        tab_remove(tab) {
            var tabs = this.list;
            if (!tabs.length) {
                return;
            }

            tabs = tabs.removeItem(it => it.name == tab);
            this.saveList(tabs);
            this.loadedTabs.removeItem(tab);

            if (tab == this.tabName && tabs.length) {
                this.activeTab(tabs.last().name);
            }
        }
    }
}
</script>
<style lang="scss">
.el-tabs__item .el-icon-close {
    margin-right: -10px;
    margin-left: 10px;
}

.iframe-tab {
    flex: 1;
    display: flex;
    flex-direction: column;

    .el-tabs__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
    }
}

.el-tab-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>
