<template>

    <el-tabs type="card" v-model="tabName"
             v-bind="[$attrs]"
             style="flex: 1;display: flex;flex-direction: column;"
             class="iframe-tab"
             @tab-click="tab_change"
             @tab-remove="tab_remove"
             :before-leave="tab_leave"
             v-if="list.length" v-menu:m1
    >
        <el-tab-pane v-for="tab in list" :name="tab.name" :label="tab.name + ' '"
                     :key="tab.path" :closable="tab.name != homeName">
            <iframe frameborder="no" :src="tab.path_com"
                    v-if="tabName == tab.name || loadedTabs.includes(tab.name)"
                    style="flex: 1;display: flex;flex-direction: column;"
            ></iframe>
        </el-tab-pane>
    </el-tabs>
</template>

<script>

//$router.push ，刷新URL，不刷新页面。

jv.getIframeUrl = function (path) {
    var json = jv.query2Json(BASE_URL.slice(0, -1) + path);
    json["_com_"] = true;
    return jv.param(json, true);
}

class TabItemData {
    name = ""
    root = ""
    path = ""

    constructor(name, root, path) {
        this.name = name;
        this.root = root;
        this.path = path || root;
    }

    root_com() {
        return jv.getIframeUrl(this.root);
    }

    path_com() {
        return jv.getIframeUrl(this.path);
    }
}

export default {
    data() {
        return {
            loadedTabs: [],
            tabName: "",
            list: [],
            tabs_key: "$tabs",
            homeName: "首页",
            homePath: "/"
        };
    },
    props: {
        value: {
            type: String, default: () => ""
        },
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
                this.tabName = val;
            }
        }
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
            this.$emit("input", tabName);
        },
        reloadTab(tabName) {
            this.activeTab(tabName);
            var target = this.$refs.m1.target;
            var contents_div = target.closest(".el-tabs").querySelector(".el-tabs__content")
            var content_iframe = contents_div.children[target.indexOfParent].querySelector("iframe");
            content_iframe.src = content_iframe.src;
        },
        fullscreen(tabName) {
            this.activeTab(tabName);
            var target = this.$refs.m1.target;
            var contents_div = target.closest(".el-tabs").querySelector(".el-tabs__content")
            var content_iframe = contents_div.children[target.indexOfParent].querySelector("iframe");
            content_iframe.classList.add("fullscreen");
            document.body.classList.add("fullscreen");
            document.body.querySelector(".fullscreen-div").style.animation = "loading 1s"
        },
        toHomeTab(tabName) {
            // var target = this.$refs.m1.target;
            // var tabName = target.innerText.trim();
            this.activeTab(tabName)
            var tab = this.list.filter(it => it.name == tabName)[0];
            tab.path = tab.root;
            tab.path_com = tab.root_com;
            this.saveList(this.list);
        },
        init(homeName, homePath, routeMetaKey) {
            this.homeName = homeName;
            this.homePath = homePath;

            var tabs = localStorage.getJson(this.tabs_key);
            if (!tabs) {
                tabs = [new TabItemData(homeName, homePath)]
            }

            this.activeTab(this.$route.meta[routeMetaKey || "tab"] || homeName);
            if (!this.loadedTabs.includes(this.tabName)) {
                this.loadedTabs.push(this.tabName);
            }

            var path = this.$route.path

            var last = tabs.last(it => it.name == this.tabName);

            if (last) {
                last.path = path;
            } else {
                tabs.push(new TabItemData(this.tabName, path));
            }
            this.saveList(tabs);
        },
        saveList(tabs) {
            localStorage.setJson(this.tabs_key, tabs);
            this.list = tabs;
        },
        tab_leave(tab, oldActiveName) {
            if (!this.loadedTabs.includes(tab)) {
                this.loadedTabs.push(tab);
            }

            var item = this.list.last(it => it.name == tab);

            top.history.pushState('', '', BASE_URL.slice(0, -1) + item.path);
        },
        tab_change(tab, ev) {

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
<style lang="scss" scoped>
.tab-view {
    height: 100%;

    .iframe-tab {
        height: 100% !important;
    }
}

iframe.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: white;
    z-index: 1999;
}

.move-enter-active, .move-leave-active {
    transition: opacity 1s;
}

.move-enter, .move-leave {
    opacity: 0;
}

.el-tabs__header {
    margin: 0;
}

/deep/ .el-tabs__item .el-icon-close {
    margin-right: -10px;
    margin-left: 10px;
}

/deep/ .iframe-tab .el-tabs__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
}

/deep/ .el-tab-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>
